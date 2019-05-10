# dep-plugin

## compilation

```javascript
// https://github.com/webpack/webpack/blob/master/lib/SingleEntryPlugin.js
class SingleEntryPlugin {
  apply(compiler) {
    compiler.plugin("compilation", (compilation, params) => {
      const normalModuleFactory = params.normalModuleFactory;
      // 这里记录了 SingleEntryDependency 对应的工厂对象是 NormalModuleFactory
      compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
    });

    compiler.plugin("make", (compilation, callback) => {
      // 入口的模块会先变成一个 Dependency 对象
      const dep = SingleEntryPlugin.createDependency(this.entry, this.name);
      compilation.addEntry(this.context, dep, this.name, callback);
    });
  }
}
// https://github.com/webpack/webpack/blob/master/lib/Compilation.js
class Compilation extends Tapable {
  _addModuleChain(context, dependency, onModule, callback) {
    // 其他代码..
    // 开始构建时，通过 Compilation 的 dependenciesFactories 属性找到对应的工厂对象
    const moduleFactory = this.dependencyFactories.get(dependency.constructor);
    if(!moduleFactory) {
      throw new Error(`No dependency factory available for this dependency type:
      ${dependency.constructor.name}`);
    }
    this.semaphore.acquire(() => {
      // 调用工厂对象的 create 方法，dependency作为参数传入，最终生成模块实例
      moduleFactory.create({
        contextInfo: {
          issuer: "",
          compiler: this.compiler.name
        },
        context: context,
        dependencies: [dependency] // 作为参数传入
      }, (err, module) => {
        // module就是生成的模块实例
        // 其他代码..
      })
    })
  }
}
```
## 在vscode中调试webpack-cli

## module依赖关系的生成

### 使用issuer分析依赖关系

1. 先通过filter过滤掉不需要的模块(如css,node_modules中的模块等)
2. 构建一个modulesMap（不包含依赖关系）
3. 通过issuer属性往modulesMap中的模块添加关系

```javascript
//结果
modulesMap: {
  './src/components/page/index.jsx': {
    id: './src/components/page/index.jsx',
    issuer: ['./src/app.jsx']
  }
}
```

### 同个模块被多个模块引用 依赖链欠缺

当a被b,c引用，发现按照原来思路只分析到b-->a,欠缺c-->a  
解决：使用module.reasons  
新的问题: reasons中有重复

### reasons中有重复

```javascript
// main.js引用 app.jsx
// ./src/app.jsx ---reasons---> 
[
  ModuleReason {
    //...
    module: 
      NormalModule {
        //...
        id: './src/main.js',
        index: 0,
        index2: 43,
        depth: 0,
        issuer: null,
        _buildHash: 'd6b952a9726b274d4a459a7c4675fd20',
        buildTimestamp: 1557453182090,
        _cachedSources: Map {},
      }
  }, 
  ModuleReason {
    //...
    module: 
      NormalModule {
        //...
        id: './src/main.js',
        index: 0,
        index2: 43,
        depth: 0,
        issuer: null,
        _buildHash: 'd6b952a9726b274d4a459a7c4675fd20',
        buildTimestamp: 1557453182090,
        _cachedSources: Map {},
      }
  }
]
```

可以发现，ModuleReason.module是一样的  
解决：做一个重复过滤 set  
新的问题：set通过JSON.stringfy后变成了空对象

### set序列化问题

原理：感觉是set的实现机制吧 给对象添加不可枚举的key 所以序列化时被忽略（待研究）  
解决：set先转为数组 Array.from
