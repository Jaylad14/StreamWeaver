const express = require('express');
const fs = require('fs');
const { getFileInfo } = require('../utils/fileStore');
const TransformEngine = require('../utils/transformEngine');
const CSVParser = require('../utils/csvParser');
const { cleanRows } = require('../utils/cleaner');

const router = express.Router();
const transformEngine = new TransformEngine();
let wsManager = null;

router.setWSManager = (manager) => {
  wsManager = manager;
};

const sendProgress = (fileId, processed, total, startedAt) => {
  if (!wsManager) return;
  const elapsed = (Date.now() - startedAt) / 1000 || 0.001;
  const percentage = total ? Math.round((processed / total) * 100) : 0;
  wsManager.broadcast({
    type: 'progress',
    fileId,
    processed,
    total,
    percentage,
    rowsPerSec: Math.round(processed / elapsed),
    errorCount: 0
  });
};

const applyMapping = (rows, mappings) => {
  const pairs = Object.entries(mappings || {}).filter(([src, dest]) => src && dest);
  if (pairs.length === 0) return rows;
  return rows.map((row) => {
    const out = {};
    for (const [src, dest] of pairs) {
      out[dest] = row[src] === undefined ? null : row[src];
    }
    return out;
  });
};

router.post('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const cleaning = req.body.cleaning || {};
  const startedAt = Date.now();
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
      console.log('TOTAL ROWS:', rows.length);
      processedRows = rows;
    } else if (fileExt === 'json') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      processedRows = Array.isArray(data) ? data : [data];
    }

    const total = processedRows.length;
    sendProgress(fileId, 0, total, startedAt);
    const { rows: cleanedRows, report: cleaningReport } = cleanRows(processedRows, cleaning);
    sendProgress(fileId, total, total, startedAt);
    const customCode = (req.body.customCode || '').trim();
    let codeRows = cleanedRows;
    if (customCode) {
      const result = await transformEngine.executeTransform(customCode, cleanedRows);
      if (!result.success) {
        return res.status(400).json({ error: 'Custom code error: ' + result.error });
      }
      codeRows = result.data;
    }
    const finalRows = applyMapping(codeRows, req.body.mappings || {});
    console.log('CLEANING REPORT:', cleaningReport);

    console.log('SENDING RESPONSE');
    res.json({
      success: true,
      rowsProcessed: finalRows.length,
      rowsSuccessful: finalRows.length,
      rowsFailed: 0,
      cleaningReport,
      sampleRows: finalRows.slice(0, 5),
      transformedData: finalRows
    });
  } catch (error) {
    console.error('TRANSFORM ERROR:', error.message);
    console.error(error);
    res.status(500).json({ error: 'Processing failed. Check the server log.' });
  }
});

module.exports = router;
