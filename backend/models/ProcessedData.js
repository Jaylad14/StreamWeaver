const mongoose = require('mongoose');

const processedDataSchema = new mongoose.Schema({
  fileId: String,
  fileName: String,
  uploadedAt: { type: Date, default: Date.now },
  totalRows: Number,
  processedRows: Number,
  data: [mongoose.Schema.Types.Mixed]
});

module.exports = mongoose.model('ProcessedData', processedDataSchema);
