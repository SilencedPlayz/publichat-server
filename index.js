import http from "http";
import { WebSocketServer } from "ws";

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {
  console.log("Connection has been made");

  ws.on("message", (msg) => {
    const message = msg.toString();
    const obj = JSON.parse(message)
    if(obj.type === "data"){
      ws.username = obj.username
    }else
    if(obj.type === "online"){
      ws.send(JSON.stringify({type: "online", amount: wss.clients.size}))
    }else{
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      })
    }
  });

  ws.on("close", () => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({type: "log", msg: `${ws.username} disconnected`}));
      }
    })
    console.log("Connection lost");
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
