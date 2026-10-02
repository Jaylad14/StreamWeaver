const express = require('express');
const fs = require('fs');
const { getFileInfo } = require('../utils/fileStore');
const TransformEngine = require('../utils/transformEngine');
const CSVParser = require('../utils/csvParser');

const router = express.Router();
const transformEngine = new TransformEngine();
let wsManager = null;

router.setWSManager = (manager) => {
  wsManager = manager;
};

router.post('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  console.log('TRANSFORM REQUEST:', fileId);

  try {
    const fileInfo = getFileInfo(fileId);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = fileInfo.path;
    const fileExt = fileInfo.name.split('.').pop().toLowerCase();
    console.log('FILE EXT:', fileExt);

    let processedRows = [];

    if (fileExt === 'csv') {
      console.log('PARSING CSV...');
      const { headers, rows } = await CSVParser.parseFile(filePath);
      console.log('HEADERS:', headers);
      console.log('FIRST ROW:', rows[0]);
      console.log('TOTAL ROWS:', rows.length);
      processedRows = rows;
    } else if (fileExt === 'json') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const rows = Array.isArray(data) ? data : [data];
      processedRows = rows;
    }

    console.log('SENDING RESPONSE');
    res.json({
      success: true,
      rowsProcessed: processedRows.length,
      rowsSuccessful: processedRows.length,
      rowsFailed: 0,
      sampleRows: processedRows.slice(0, 5),
      transformedData: processedRows
    });
  } catch (error) {
    console.error('TRANSFORM ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
