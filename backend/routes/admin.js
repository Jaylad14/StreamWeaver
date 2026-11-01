const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');

const router = express.Router();

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

router.get('/overview', async (req, res) => {
  try {
    const days = Number(req.query.days) === 7 ? 7 : 30;
    const since = daysAgo(days);
    const prevSince = daysAgo(days * 2);

    const [insertedAgg, filesCount, failedCount, activeUsers, usersTotal, uploadTypes, daily, recent, topUsers] = await Promise.all([
      Activity.aggregate([
        { $match: { action: 'insert', status: 'success', createdAt: { $gte: since } } },
        { $group: { _id: null, rows: { $sum: '$rowCount' } } }
      ]),
      Activity.countDocuments({ action: 'upload', status: 'success', createdAt: { $gte: since } }),
      Activity.countDocuments({ status: 'failed', createdAt: { $gte: since } }),
      Activity.distinct('email', { createdAt: { $gte: since } }),
      User.countDocuments(),
      Activity.aggregate([
        { $match: { action: 'upload', status: 'success', createdAt: { $gte: since } } },
        { $project: { ext: { $toLower: { $arrayElemAt: [{ $split: ['$fileName', '.'] }, -1] } } } },
        { $group: { _id: '$ext', count: { $sum: 1 } } }
      ]),
      Activity.aggregate([
        { $match: { action: 'insert', status: 'success', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, rows: { $sum: '$rowCount' } } },
        { $sort: { _id: 1 } }
      ]),
      Activity.find({}).sort({ createdAt: -1 }).limit(8).lean(),
      Activity.aggregate([
        { $match: { action: 'insert', status: 'success', createdAt: { $gte: since } } },
        { $group: { _id: '$email', rows: { $sum: '$rowCount' }, runs: { $sum: 1 } } },
        { $sort: { rows: -1 } },
        { $limit: 5 }
      ])
    ]);

    const rowsInserted = insertedAgg[0]?.rows || 0;
    const prevRows = (await Activity.aggregate([
      { $match: { action: 'insert', status: 'success', createdAt: { $gte: prevSince, $lt: since } } },
      { $group: { _id: null, rows: { $sum: '$rowCount' } } }
    ]))[0]?.rows || 0;
    const change = prevRows ? Math.round(((rowsInserted - prevRows) / prevRows) * 100) : null;

    res.json({
      days,
      kpis: {
        rowsInserted,
        rowsChangePct: change,
        filesProcessed: filesCount,
        failedRuns: failedCount,
        activeUsers: activeUsers.length,
        totalUsers: usersTotal
      },
      fileTypes: uploadTypes.map((t) => ({ type: t._id, count: t.count })),
      daily: daily.map((d) => ({ date: d._id, rows: d.rows })),
      topUsers: topUsers.map((u) => ({ email: u._id, rows: u.rows, runs: u.runs })),
      recent: recent.map((r) => ({
        action: r.action,
        status: r.status,
        email: r.email,
        fileName: r.fileName,
        rowCount: r.rowCount,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ error: 'Could not load the overview.' });
  }
});

module.exports = router;
