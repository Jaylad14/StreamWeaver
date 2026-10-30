const ivm = require('isolated-vm');

class TransformEngine {
  constructor() {
    this.isolate = new ivm.Isolate({ memoryLimit: 128 });
  }

  async executeTransform(code, rows) {
    const context = await this.isolate.createContext();
    try {
      const jail = context.global;
      await jail.set('inputJson', JSON.stringify(rows));

      const script = `
        (function () {
          var input = JSON.parse(inputJson);
          var output = input.map(function (row) {
            ${code}
            return row;
          });
          return JSON.stringify(output);
        })();
      `;

      const outputJson = await context.eval(script, { timeout: 5000 });
      return { success: true, data: JSON.parse(outputJson) };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      context.release();
    }
  }

  async validateCode(code) {
    try {
      const context = await this.isolate.createContext();
      await context.eval(`(function () { ${code} })();`);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = TransformEngine;
