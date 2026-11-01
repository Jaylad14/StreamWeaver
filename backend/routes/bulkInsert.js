const express = require('express');
const crypto = require('crypto');
const RowData = require('../models/RowData');
const { getFileInfo } = require('../utils/fileStore');
const { logActivity } = require('../utils/activity');

const router = express.Router();
const BATCH_SIZE = 5000;

router.post('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { data, fileName } = req.body;

  try {
    const fileInfo = getFileInfo(fileId);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No data to insert' });
    }

    const batchId = crypto.randomUUID();
    const name = fileName || fileInfo.name;
    let inserted = 0;

    for (let start = 0; start < data.length; start += BATCH_SIZE) {
      const slice = data.slice(start, start + BATCH_SIZE);
      const docs = slice.map((row, i) => ({
        batchId,
        fileId,
        fileName: name,
        rowIndex: start + i,
        data: row
      }));
      await RowData.insertMany(docs, { ordered: true });
      inserted += docs.length;
    }

    logActivity(req, { action: 'insert', status: 'success', fileName: name, fileId, rowCount: inserted });
    res.json({
      success: true,
      insertedRows: inserted,
      recordId: batchId
    });
  } catch (error) {
    console.error('Bulk insert error:', error);
    logActivity(req, { action: 'insert', status: 'failed', fileId: req.params.fileId, rowCount: 0 });
    res.status(500).json({ error: 'Insert failed. Check the server log.' });
  }
});

router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;

  try {
    const count = await RowData.countDocuments({ fileId });
    if (count === 0) {
      return res.status(404).json({ error: 'No processed data found' });
    }
    const sample = await RowData.findOne({ fileId }).lean();
    res.json({
      success: true,
      record: {
        batchId: sample.batchId,
        fileId,
        fileName: sample.fileName,
        totalRows: count
      }
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
