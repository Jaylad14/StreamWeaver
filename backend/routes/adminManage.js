const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const RowData = require('../models/RowData');
const { logActivity } = require('../utils/activity');

const router = express.Router();
const isId = (value) => mongoose.isValidObjectId(value);
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  verified: u.verified !== false,
  disabled: !!u.disabled,
  createdAt: u.createdAt
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role verified disabled createdAt').sort({ createdAt: -1 }).lean();
    res.json({ users: users.map(publicUser) });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Could not load users.' });
  }
});

router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ error: 'Invalid user.' });

  const changes = {};
  if (req.body.role !== undefined) {
    if (!['user', 'admin'].includes(req.body.role)) {
      return res.status(400).json({ error: 'Role must be user or admin.' });
    }
    changes.role = req.body.role;
  }
  if (req.body.disabled !== undefined) {
    changes.disabled = req.body.disabled === true;
  }
  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: 'Nothing to change.' });
  }
  if (id === req.user.sub && (changes.disabled === true || changes.role === 'user')) {
    return res.status(400).json({ error: 'You cannot disable yourself or remove your own admin role.' });
  }

  try {
    const user = await User.findByIdAndUpdate(id, changes, { new: true }).select('name email role verified disabled createdAt').lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    logActivity(req, { action: 'update', status: 'success', fileName: `user ${user.email}: ${JSON.stringify(changes)}`, rowCount: 0 });
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Could not update the user.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ error: 'Invalid user.' });
  if (id === req.user.sub) return res.status(400).json({ error: 'You cannot delete your own account.' });

  try {
    const user = await User.findByIdAndDelete(id).lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    logActivity(req, { action: 'delete', status: 'success', fileName: `user ${user.email}`, rowCount: 0 });
    res.json({ deleted: true, email: user.email });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Could not delete the user.' });
  }
});

router.get('/records', async (req, res) => {
  try {
    const batches = await RowData.aggregate([
      { $group: { _id: '$batchId', fileId: { $first: '$fileId' }, fileName: { $first: '$fileName' }, rows: { $sum: 1 }, insertedAt: { $min: '$insertedAt' } } },
      { $sort: { insertedAt: -1 } },
      { $limit: 50 }
    ]);
    res.json({
      records: batches.map((b) => ({ batchId: b._id, fileId: b.fileId, fileName: b.fileName, rows: b.rows, insertedAt: b.insertedAt }))
    });
  } catch (error) {
    console.error('List records error:', error);
    res.status(500).json({ error: 'Could not load records.' });
  }
});

router.delete('/records/:batchId', async (req, res) => {
  const { batchId } = req.params;
  try {
    const result = await RowData.deleteMany({ batchId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Record not found.' });
    logActivity(req, { action: 'delete', status: 'success', fileName: `records batch ${batchId}`, rowCount: result.deletedCount });
    res.json({ deleted: result.deletedCount });
  } catch (error) {
    console.error('Delete records error:', error);
    res.status(500).json({ error: 'Could not delete the records.' });
  }
});

module.exports = router;
