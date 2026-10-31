const mongoose = require('mongoose');

const rowSchema = new mongoose.Schema({
  batchId: { type: String, required: true, index: true },
  fileId: { type: String, required: true, index: true },
  fileName: String,
  rowIndex: Number,
  data: mongoose.Schema.Types.Mixed,
  insertedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RowData', rowSchema, 'processed_rows');
