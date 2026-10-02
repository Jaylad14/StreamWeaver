class CSVParser {
  static parseRow(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  static parseFile(filePath) {
    const fs = require('fs');
    const readline = require('readline');
    const rows = [];
    let headers = null;

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        if (!line.trim()) return;

        if (!headers) {
          headers = this.parseRow(line);
          return;
        }

        const values = this.parseRow(line);
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || null;
        });
        rows.push(row);
      });

      rl.on('close', () => {
        resolve({ headers, rows });
      });

      rl.on('error', reject);
    });
  }
}

module.exports = CSVParser;
