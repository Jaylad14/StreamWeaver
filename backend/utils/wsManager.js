const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { URL } = require('url');

class WSManager {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();

    this.wss.on('connection', (ws, req) => {
      try {
        const token = new URL(req.url, 'http://localhost').searchParams.get('token');
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        ws.close(1008, 'Sign in required');
        return;
      }
      this.clients.add(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

module.exports = WSManager;
