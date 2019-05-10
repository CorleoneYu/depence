let index = 0;

class Module {
  constructor(module) {
    this.id = module.id;
    this.index = index++;
    this.dependencies = new Set();
    this.issuer = new Set();
  }
}

module.exports = Module;