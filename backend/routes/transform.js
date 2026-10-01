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

  try {
    const fileInfo = getFileInfo(fileId);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (customCode) {
      const validation = await transformEngine.validateCode(customCode);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Invalid code: ' + validation.error });
      }
    }

    const filePath = fileInfo.path;
    const fileExt = fileInfo.name.split('.').pop().toLowerCase();
    
    let rowCount = 0;
    let processedRows = [];
    const startTime = Date.now();

    const broadcastProgress = (processed, total) => {
      if (wsManager) {
        wsManager.broadcast({
          type: 'progress',
          fileId: fileId,
          processed: processed,
          total: total,
          percentage: Math.round((processed / total) * 100),
          rowsPerSec: Math.round(processed / ((Date.now() - startTime) / 1000))
        });
      }
    };

    if (fileExt === 'json') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const rows = Array.isArray(data) ? data : [data];
      const totalRows = rows.length;

      for (const row of rows) {
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

        if (customCode) {
          const result = await transformEngine.executeTransform(customCode, transformedRow);
          if (result.success) {
            transformedRow = result.data;
          }
        }

        processedRows.push(transformedRow);
        rowCount++;

        if (rowCount % 100 === 0) {
          broadcastProgress(rowCount, totalRows);
        }
      }

      broadcastProgress(rowCount, totalRows);
    } else {
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });

      let headers = null;
      let totalRows = 0;

      for await (const line of rl) {
        if (!line.trim()) continue;

        if (!headers) {
          headers = line.split(',').map(col => col.trim());
          continue;
        }

        const values = line.split(',').map(val => val.trim());
        let row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });

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

        if (customCode) {
          const result = await transformEngine.executeTransform(customCode, transformedRow);
          if (result.success) {
            transformedRow = result.data;
          }
        }

        processedRows.push(transformedRow);
        rowCount++;
        totalRows++;

        if (rowCount % 100 === 0) {
          broadcastProgress(rowCount, totalRows);
        }
      }

      broadcastProgress(rowCount, totalRows);
    }

    res.json({
      success: true,
      rowsProcessed: rowCount,
      sampleRows: processedRows.slice(0, 5),
      transformedData: processedRows
    });
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({ error: 'Transform failed: ' + error.message });
  }
});

module.exports = router;
