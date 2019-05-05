let index = 0;

class Module {
  constructor(module) {
    this.id = module.id;
    this.index = index++;
    this.dependencies = [];
    this.issuer = []
  }
}

module.exports = Module;