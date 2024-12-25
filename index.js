const express = require('express');
const app = express();
const WebSocket = require('ws');
const port = process.env.PORT || 8080

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
    ws.on('message', message => {
        try {
            const parsedMessage = JSON.parse(message);

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
            ws.send(JSON.stringify({sender: "server", recipient: "client", messageType: "error", content: "Invalid JSON message"}));
        }
    });
});

function handleFlashMessage(ws, message) {
    if (message.messageType === 'technical_query') {
        let responseContent = "";
        if (message.content.includes("Yjs")) {
            responseContent = "Yjs is a CRDT that allows for real-time collaborative editing.";
        } else if (message.content.includes("access control")) {
            responseContent = "Access control can be implemented by adding a layer of authentication and authorization on the server.";
        } else {
            responseContent = "I can help with technical implementations and code examples. Ask me about Yjs, WebSockets, or other technical topics.";
        }
        ws.send(JSON.stringify({ sender: "flash", recipient: "client", messageType: "technical_response", content: responseContent }));
    } else {
      ws.send(JSON.stringify({sender:"flash", recipient: "client", messageType: "response", content: "I only handle technical queries."}));
    }
}

function handleRubyMessage(ws, message) {
    if (message.messageType === 'strategy_request') {
        ws.send(JSON.stringify({ sender: "ruby", recipient: "client", messageType: "strategy_response", content: "We should focus on user experience in this phase." }));
    } else {
      ws.send(JSON.stringify({sender:"ruby", recipient: "client", messageType: "response", content: "I handle strategy requests."}));
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