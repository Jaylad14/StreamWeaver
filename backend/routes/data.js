const express = require('express');
const fs = require('fs');
const readline = require('readline');
const { getFileInfo } = require('../utils/fileStore');

const router = express.Router();

router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  try {
    const fileInfo = getFileInfo(fileId);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = fileInfo.path;
    const fileExt = fileInfo.name.split('.').pop().toLowerCase();
    
    if (fileExt === 'json') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const rows = Array.isArray(data) ? data : [data];
      const sliced = rows.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
      
      res.json({
        rows: sliced,
        total: rows.length,
        offset: parseInt(offset),
        limit: parseInt(limit)
      });
    } else {
      const rows = [];
      let currentRow = 0;
      let headers = null;

      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });

      for await (const line of rl) {
        if (!line.trim()) continue;

        if (currentRow === 0) {
          headers = line.split(',').map(col => col.trim());
          currentRow++;
          continue;
        }

        if (currentRow - 1 >= parseInt(offset) && rows.length < parseInt(limit)) {
          const values = line.split(',').map(val => val.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || null;
          });
          rows.push(row);
        }

        currentRow++;
        if (rows.length >= parseInt(limit)) break;
      }

      res.json({
        rows: rows,
        total: currentRow - 1,
        offset: parseInt(offset),
        limit: parseInt(limit)
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

module.exports = router;
