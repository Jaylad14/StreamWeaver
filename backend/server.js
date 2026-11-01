const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const { connectDB } = require('./utils/mongoConnection');

connectDB();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(require('helmet')());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

const uploadRoutes = require('./routes/upload');
const dataRoutes = require('./routes/data');
const transformRoutes = require('./routes/transform');
const bulkInsertRoutes = require('./routes/bulkInsert');
const qualityRoutes = require('./routes/quality');
const authRoutes = require('./routes/auth');
const requireAuth = require('./middleware/requireAuth');
const apiLimit = require('./middleware/apiLimit');
const requireAdmin = require('./middleware/requireAdmin');
const adminRoutes = require('./routes/admin');
const adminManageRoutes = require('./routes/adminManage');
const WSManager = require('./utils/wsManager');

app.use('/api/upload', requireAuth, apiLimit, uploadRoutes);
app.use('/api/data', requireAuth, apiLimit, dataRoutes);
app.use('/api/transform', requireAuth, apiLimit, transformRoutes);
app.use('/api/bulkInsert', requireAuth, apiLimit, bulkInsertRoutes);
app.use('/api/quality', requireAuth, apiLimit, qualityRoutes);
app.use('/api/admin', requireAuth, apiLimit, requireAdmin, adminRoutes);
app.use('/api/admin', requireAuth, apiLimit, requireAdmin, adminManageRoutes);
app.use('/api/auth', authRoutes);

const wsManager = new WSManager(server);
transformRoutes.setWSManager(wsManager);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', memory: process.memoryUsage() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
