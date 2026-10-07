const fs = require('fs');
const path = require('path');

class FileValidator {
  static MAGIC_BYTES = {
    json: [0x7B, 0x22], // {"
    csv: [0x22, 0x2C], // "," or just text
    txt: [0x0A, 0x0D], // \n\r
  };

  static MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  static ALLOWED_EXTENSIONS = ['json', 'csv', 'txt'];
  static DANGEROUS_PATTERNS = /(\.\.|\/\/|\\\\|null|undefined|`|eval|require|import)/gi;

  static validateFileName(fileName) {
    if (!fileName || fileName.length > 255) {
      return { valid: false, error: 'Invalid filename length' };
    }

    if (this.DANGEROUS_PATTERNS.test(fileName)) {
      return { valid: false, error: 'Filename contains dangerous characters' };
    }

    const ext = fileName.split('.').pop().toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `File type .${ext} not allowed. Use: ${this.ALLOWED_EXTENSIONS.join(', ')}` };
    }

    return { valid: true };
  }

  static validateFileSize(sizeBytes) {
    if (sizeBytes <= 0) {
      return { valid: false, error: 'File is empty' };
    }

    if (sizeBytes > this.MAX_FILE_SIZE) {
      return { valid: false, error: `File exceeds 100MB limit (${(sizeBytes / 1024 / 1024).toFixed(2)}MB)` };
    }

    return { valid: true };
  }

  static validateMagicBytes(filePath, expectedExt) {
    try {
      const buffer = Buffer.alloc(2);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 2, 0);
      fs.closeSync(fd);

      const firstBytes = Array.from(buffer);

      if (expectedExt === 'json') {
        if (firstBytes[0] !== 0x7B) { // {
          return { valid: false, error: 'File magic bytes do not match JSON format' };
        }
      } else if (expectedExt === 'csv') {
        // CSV can start with many characters, just check it's text-based
        if (firstBytes[0] < 0x20 && firstBytes[0] !== 0x09 && firstBytes[0] !== 0x0A) {
          return { valid: false, error: 'File appears to be binary, not CSV' };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Could not verify file format: ' + error.message };
    }
  }

  static validateFilePath(filePath, basePath) {
    const normalized = path.normalize(filePath);
    const resolved = path.resolve(normalized);
    const baseResolved = path.resolve(basePath);

    if (!resolved.startsWith(baseResolved)) {
      return { valid: false, error: 'Path traversal attack detected' };
    }

    return { valid: true };
  }
}

module.exports = FileValidator;
