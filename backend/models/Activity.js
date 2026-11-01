const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: String, index: true },
  email: String,
  action: { type: String, enum: ['upload', 'process', 'insert', 'update', 'delete'], required: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  fileName: String,
  fileId: String,
  rowCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Activity', activitySchema);
