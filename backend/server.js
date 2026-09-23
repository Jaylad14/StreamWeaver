const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const uploadRoutes = require('./routes/upload');
const dataRoutes = require('./routes/data');
const transformRoutes = require('./routes/transform');
const WSManager = require('./utils/wsManager');

app.use('/api/upload', uploadRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/transform', transformRoutes);

const wsManager = new WSManager(server);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', memory: process.memoryUsage() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
