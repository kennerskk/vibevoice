const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on("connection", (ws) => {
  let clientId = null;

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "join") {
      clientId = data.id;
      clients.set(clientId, ws);
      for (const [id, client] of clients.entries()) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "joined", id: clientId }));
        }
      }
      return;
    }

    if (data.target && clients.has(data.target)) {
      const targetSocket = clients.get(data.target);
      if (targetSocket.readyState === WebSocket.OPEN) {
        targetSocket.send(JSON.stringify({ ...data, from: clientId }));
      }
    }
  });

  ws.on("close", () => {
    if (clientId) clients.delete(clientId);
  });
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
