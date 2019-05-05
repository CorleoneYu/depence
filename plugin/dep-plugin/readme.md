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

## module

```javascript
id: './src/components/page/index.jsx',
dependencies: []
issuer: { id: './src/app.jsx'}
```