// Backend Code
const http = require("http");
const express = require("express");
const app = express();
const WebSocket = require("ws");

app.use(express.static("public"));
const serverPort = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let keepAliveId;

// Add a variable to store the counter
let currentCounter = 0.5;

server.listen(serverPort);
console.log(`Server started on port ${serverPort}`);

wss.on("connection", function (ws) {
  console.log("Connection Opened");

  // Send the current counter value to the newly connected client
  ws.send(JSON.stringify({ 'yes': currentCounter.toFixed(1), 'no': currentCounter.toFixed(1) }));

  if (wss.clients.size === 1) {
    keepServerAlive();
  }

  ws.on("message", (data) => {
    let receivedData = JSON.parse(data.toString());
    if (receivedData.yes !== undefined) {
      currentCounter = parseFloat(receivedData.yes);
    }
    broadcast(ws, data.toString(), false);
  });

  ws.on("close", () => {
    if (wss.clients.size === 0) {
      clearInterval(keepAliveId);
    }
  });
});

const broadcast = (ws, message, includeSelf) => {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const keepServerAlive = () => {
  keepAliveId = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('ping');
      }
    });
  }, 50000);
};

app.get('/', (req, res) => {
    res.send('Hello World!');
});
