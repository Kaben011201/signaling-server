import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3001;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

console.log("🚀 Signaling server running on port", PORT);
