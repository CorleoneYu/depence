const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path')
const Module = require('./src/Module');

class DepPlugin {
  constructor(entry) {
    this.app = app;
    this.isOpen = false;
    this.entry = entry;
    this.moduleMap = {}
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('DepPlugin', compilation => {
      compilation.hooks.afterOptimizeModuleIds.tap('DepPlugin', (modules) => {
        modules = this.filterModule(modules);
        this.buildModuleMap(modules);
        this.openServer()
      });
    });
  }

  openServer() {
    if (!this.isOpen) {
      const app = this.app;
      const moduleMap = this.moduleMap;
      const entry = this.entry;

      app.use(bodyParser.json());
      app.get('/api/deps/getDeps', (req, res) => {
        return res.json({status: 1, data: {
          moduleMap,
          entry
        }});
      })

      app.use(express.static(path.join(__dirname, './dist')));

      app.listen(8081, function () {
        console.log("应用实例 8081")
      })

      this.isOpen = true;
    }
  }

  buildModuleMap(modules) {
    modules.forEach(module => {
      if (!this.moduleMap[module.id]) {
        this.moduleMap[module.id] = new Module(module);
      }
    })

    modules.forEach(module => {
      let reasons = module.reasons;
      reasons.forEach(reason => {
        let issuer = reason.module;
        if (issuer) {
          console.log(`${module.id} -----reason----- ${issuer.id}`);
          this.moduleMap[issuer.id].dependencies.add(module.id);
          this.moduleMap[module.id].issuer.add(issuer.id);
        }
      })
    })

    this.set2Ary()    
  }

  // 发现set
  set2Ary() {
    Object.keys(this.moduleMap).forEach( key => {
      let module = this.moduleMap[key]
      module.issuer = Array.from(module.issuer);
      module.dependencies = Array.from(module.dependencies);
    })
  }

  filterModule(modules) {
    //不能直接修改modules
    let copy = [...modules];
    for (let i = 0; i < copy.length; i++) {
      let module = copy[i];
      if (!this.filter(module.id)) {
        copy.splice(i, 1);
        i--;
      }
    }
    return copy;
  }

  filter(moduleId) {
    moduleId = String(moduleId);

    if (moduleId.match(/node_modules/)) {
      return false;
    }

    if (moduleId.match(/\.(css|less|sass)$/)) {
      return false;
    }

    if (moduleId.match(/\?/)) {
      return false;
    }
    return true;
  }
}

module.exports = DepPlugin;
