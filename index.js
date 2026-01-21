import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: PORT });

// roomId -> Set(ws)
const rooms = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    // JOIN ROOM
    if (data.type === "join") {
      ws.roomId = data.roomId;
      ws.userId = data.userId;

      if (!rooms.has(ws.roomId)) {
        rooms.set(ws.roomId, new Set());
      }

      rooms.get(ws.roomId).add(ws);

      // Notify existing users
      rooms.get(ws.roomId).forEach((client) => {
        if (client !== ws) {
          client.send(
            JSON.stringify({
              type: "user-joined",
              userId: ws.userId,
            }),
          );
        }
      });

      return;
    }

    // RELAY SIGNAL
    if (data.type === "signal") {
      rooms.get(ws.roomId)?.forEach((client) => {
        if (client !== ws && client.userId === data.to) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on("close", () => {
    if (!ws.roomId) return;

    rooms.get(ws.roomId)?.delete(ws);

    rooms.get(ws.roomId)?.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "user-left",
          userId: ws.userId,
        }),
      );
    });
  });
});

console.log("🚀 Signaling server running on port", PORT);
