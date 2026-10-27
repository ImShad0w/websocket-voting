
import { WebSocketServer } from 'ws';
import fs from 'fs';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;
const VOTOS_FILE = fileURLToPath(new URL('./votos.json', import.meta.url));

// Initialize votes
let votos = [0, 0, 0, 0];
if (fs.existsSync(VOTOS_FILE)) {
  try {
    const data = fs.readFileSync(VOTOS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.every(count => Number.isInteger(count))) {
      votos = parsed;
    } else {
      console.warn('votos.json has an invalid format, using default votes');
    }
  } catch (err) {
    console.error('Error reading votos.json:', err);
  }
} else {
  fs.writeFileSync(VOTOS_FILE, JSON.stringify(votos));
}

const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server started on port ${PORT}`);

wss.on('connection', ws => {
  console.log('Client connected');

  ws.send(JSON.stringify(votos));

  ws.on('message', message => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.hasOwnProperty('vote')) {
        const voteIndex = parsedMessage.vote;
        if (Number.isInteger(voteIndex) && voteIndex >= 0 && voteIndex < votos.length) {
          votos[voteIndex]++;
          console.log(`Vote received for option ${voteIndex + 1}. New votes: ${votos}`);

          fs.writeFileSync(VOTOS_FILE, JSON.stringify(votos));

          const updateMessage = JSON.stringify(votos);
          wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
              client.send(updateMessage);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to parse message or process vote:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

