const ivm = require('isolated-vm');

class TransformEngine {
  constructor() {
    this.isolate = new ivm.Isolate({ memoryLimit: 128 });
  }

  async executeTransform(code, data) {
    try {
      const context = await this.isolate.createContext();
      const jail = context.global;

      await jail.set('data', data);
      await jail.set('result', null);

      const script = `
        result = (function() {
          ${code}
          return data;
        })();
      `;

      await context.eval(script);
      const transformed = await jail.get('result');

      return { success: true, data: transformed };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async validateCode(code) {
    try {
      const context = await this.isolate.createContext();
      const testScript = `
        (function() {
          ${code}
        })();
      `;
      await context.eval(testScript);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = TransformEngine;
