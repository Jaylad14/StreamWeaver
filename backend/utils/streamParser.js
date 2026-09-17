const { Transform } = require('stream');
const readline = require('readline');
const fs = require('fs');

/**
 * Parse CSV file stream into JSON objects
 * Reads line-by-line to avoid loading entire file into memory
 */
class CSVStreamParser {
  constructor(filePath) {
    this.filePath = filePath;
    this.headers = null;
    this.rowCount = 0;
  }

  // Extract headers from first line
  parseHeaders(line) {
    return line.split(',').map(col => col.trim());
  }

  // Convert CSV line to JSON object
  parseRow(line, headers) {
    const values = line.split(',').map(val => val.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    return row;
  }

  /**
   * Create a Transform stream that converts CSV to JSON
   */
  createTransformStream() {
    const self = this;
    let firstLine = true;

    const rl = readline.createInterface({
      input: fs.createReadStream(this.filePath),
      crlfDelay: Infinity
    });

    const transform = new Transform({
      objectMode: true,
      transform: function(chunk, encoding, callback) {
        callback();
      }
    });

    rl.on('line', (line) => {
      if (!line.trim()) return;

      if (firstLine) {
        self.headers = self.parseHeaders(line);
        firstLine = false;
        return;
      }

      const row = self.parseRow(line, self.headers);
      self.rowCount++;
      transform.push(row);
    });

    rl.on('close', () => {
      transform.push(null);
    });

    rl.on('error', (err) => {
      transform.destroy(err);
    });

    return transform;
  }

  // Get metadata
  getMetadata() {
    return {
      rowCount: this.rowCount,
      headers: this.headers,
    };
  }
}

module.exports = CSVStreamParser;
