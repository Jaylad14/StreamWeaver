const express = require('express');
const fs = require('fs');
const { getFileInfo } = require('../utils/fileStore');
const CSVParser = require('../utils/csvParser');

const router = express.Router();

const isEmptyValue = (value) => value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

router.get('/:fileId', async (req, res) => {
  try {
    const fileInfo = getFileInfo(req.params.fileId);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    const ext = fileInfo.name.split('.').pop().toLowerCase();
    let rows = [];
    if (ext === 'csv') {
      const parsed = await CSVParser.parseFile(fileInfo.path);
      rows = parsed.rows;
    } else if (ext === 'json') {
      const data = JSON.parse(fs.readFileSync(fileInfo.path, 'utf8'));
      rows = Array.isArray(data) ? data : [data];
    }

    let emptyCells = 0;
    let untrimmedText = 0;
    const seen = new Set();
    let duplicateRows = 0;

    for (const row of rows) {
      for (const value of Object.values(row)) {
        if (isEmptyValue(value)) emptyCells += 1;
        if (typeof value === 'string' && value !== value.trim()) untrimmedText += 1;
      }
      const key = JSON.stringify(row);
      if (seen.has(key)) duplicateRows += 1;
      else seen.add(key);
    }

    res.json({
      totalRows: rows.length,
      emptyCells,
      duplicateRows,
      untrimmedText
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
