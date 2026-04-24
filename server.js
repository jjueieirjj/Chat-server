const WebSocket = require('ws');
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });
const players = new Map();

server.on('connection', (ws) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    players.set(ws, { id, name: null });
    
    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw);
            if (data.type === 'join') {
                players.get(ws).name = data.name;
                ws.send(JSON.stringify({ type: 'connected', id }));
            }
            else if (data.type === 'chat') {
                for (let [client, info] of players) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'message',
                            from: players.get(ws).name,
                            text: data.text
                        }));
                    }
                }
            }
        } catch(e) {}
    });
});
