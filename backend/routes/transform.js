const express = require('express');
const fs = require('fs');
const readline = require('readline');
const { getFileInfo } = require('../utils/fileStore');
const TransformEngine = require('../utils/transformEngine');

const router = express.Router();
const transformEngine = new TransformEngine();
let wsManager = null;

router.setWSManager = (manager) => {
  wsManager = manager;
};

router.post('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { mappings, customCode } = req.body;

  console.log('=== TRANSFORM START ===');
  console.log('FileID:', fileId);
  console.log('Mappings:', mappings);
  console.log('Custom Code:', customCode ? 'YES' : 'NO');

  try {
    const fileInfo = getFileInfo(fileId);
    console.log('File Info:', fileInfo ? 'FOUND' : 'NOT FOUND');

    if (!fileInfo) {
      console.log('ERROR: File not found');
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = fileInfo.path;
    const fileExt = fileInfo.name.split('.').pop().toLowerCase();

    let rowCount = 0;
    let processedRows = [];
    const startTime = Date.now();

    console.log('File type:', fileExt);
    console.log('Starting to process rows...');

    if (fileExt === 'json') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const rows = Array.isArray(data) ? data : [data];
      const totalRows = rows.length;

      console.log('Total rows to process:', totalRows);

      for (let idx = 0; idx < rows.length; idx++) {
        try {
          const row = rows[idx];
          let transformedRow = { ...row };

          if (mappings) {
            for (const [sourceCol, destCol] of Object.entries(mappings)) {
              if (transformedRow[sourceCol] !== undefined) {
                transformedRow[destCol] = transformedRow[sourceCol];
                if (sourceCol !== destCol) {
                  delete transformedRow[sourceCol];
                }
              }
            }
          }

          processedRows.push(transformedRow);
        } catch (rowError) {
          console.log('Row error at', idx, ':', rowError.message);
        }

        rowCount++;

        if (rowCount % 5000 === 0) {
          console.log('Processed:', rowCount, '/', totalRows);
        }
      }

      console.log('All rows processed. Total:', rowCount);
    }

    console.log('Sending response...');
    res.json({
      success: true,
      rowsProcessed: rowCount,
      rowsSuccessful: processedRows.length,
      rowsFailed: 0,
      sampleRows: processedRows.slice(0, 5),
      transformedData: processedRows
    });

    console.log('=== TRANSFORM COMPLETE ===');
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({ error: 'Transform failed: ' + error.message });
  }
});

module.exports = router;
