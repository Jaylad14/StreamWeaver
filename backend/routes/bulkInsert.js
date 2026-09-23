const express = require('express');
const ProcessedData = require('../models/ProcessedData');
const { getFileInfo } = require('../utils/fileStore');

const router = express.Router();

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

    const processedData = new ProcessedData({
      fileId: fileId,
      fileName: fileName || fileInfo.name,
      totalRows: data.length,
      processedRows: data.length,
      data: data
    });

    await processedData.save();

    res.json({
      success: true,
      insertedRows: data.length,
      recordId: processedData._id
    });
  } catch (error) {
    console.error('Bulk insert error:', error);
    res.status(500).json({ error: 'Bulk insert failed: ' + error.message });
  }
});

router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;

  try {
    const record = await ProcessedData.findOne({ fileId });
    
    if (!record) {
      return res.status(404).json({ error: 'No processed data found' });
    }

    res.json({
      success: true,
      record: {
        id: record._id,
        fileId: record.fileId,
        fileName: record.fileName,
        uploadedAt: record.uploadedAt,
        totalRows: record.totalRows,
        processedRows: record.processedRows
      }
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
