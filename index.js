const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', ws => {
    console.log("Server has connected")
    ws.send('Hello from WebSocket server!');
});
console.log("Websocket server started")