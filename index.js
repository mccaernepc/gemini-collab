const express = require('express');
const app = express();
const WebSocket = require('ws');
const port = process.env.PORT || 8080

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
    console.log("New client connected to WebSocket server"); // Log new client connection
    ws.on('message', message => {
        console.log("Raw message received:", message); // Log the raw message
        try {
            const parsedMessage = JSON.parse(message);
            console.log("Parsed message:", parsedMessage);
            if (parsedMessage.recipient === 'flash') {
                handleFlashMessage(ws, parsedMessage);
            } else if (parsedMessage.recipient === 'ruby') {
                handleRubyMessage(ws, parsedMessage);
            } else if (parsedMessage.recipient === 'all'){
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                      client.send(message);
                    }
                  });
            } else {
                ws.send(JSON.stringify({sender: "server", recipient: "client", messageType: "error", content: "Invalid recipient"}));
            }
        } catch (error) {
            console.error("Error parsing message:", message, error);
            ws.send(JSON.stringify({sender: "server", recipient: "client", messageType: "error", content: "Invalid JSON message"}));
        }
    });
});

function handleFlashMessage(ws, message) {
    console.log("Handling Flash message:", message);
    if (message.messageType === 'technical_query') {
        let responseContent = "";
        if (message.content.includes("Yjs")) {
            responseContent = "Yjs is a CRDT that allows for real-time collaborative editing.";
        } else if (message.content.includes("access control")) {
            responseContent = "Access control can be implemented by adding a layer of authentication and authorization on the server.";
        } else {
            responseContent = "I can help with technical implementations and code examples. Ask me about Yjs, WebSockets, or other technical topics.";
        }
        const response = { sender: "flash", recipient: "client", messageType: "technical_response", content: responseContent };
        console.log("Flash response:", JSON.stringify(response)); // Log the response
        ws.send(JSON.stringify(response));
    } else {
        const response = {sender:"flash", recipient: "client", messageType: "response", content: "I only handle technical queries."};
        console.log("Flash response:", JSON.stringify(response));
        ws.send(JSON.stringify(response));
    }
}

function handleRubyMessage(ws, message) {
    console.log("Handling Ruby message:", message);
    if (message.messageType === 'strategy_request') {
        const response = { sender: "ruby", recipient: "client", messageType: "strategy_response", content: "We should focus on user experience in this phase." };
        console.log("Ruby response:", JSON.stringify(response));
        ws.send(JSON.stringify(response));
    } else {
        const response = {sender:"ruby", recipient: "client", messageType: "response", content: "I handle strategy requests."};
        console.log("Ruby response:", JSON.stringify(response));
        ws.send(JSON.stringify(response));
    }
}

app.use(express.static(__dirname));

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});