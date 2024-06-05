const { results } = require('@permaweb/aoconnect');
const WebSocket = require('ws');

let cursor = '';
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('WebSocket connection opened');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket connection closed. Reconnecting...');
  setTimeout(() => {
    ws.connect(); // Attempting to reconnect
  }, 3000);
});

ws.on('message', (message) => {
  console.log('Received message:', message);
  // Message processing logic goes here
});

async function DevChatChecking() {
  try {
    if (cursor == '') {
      const resultsOut = await results({
        process: 'your id',
        sort: 'DESC',
        limit: 1,
      });
      cursor = resultsOut.edges[0].cursor;
      console.log('Initial results:', resultsOut);
    }

    console.log('DevChatCheking------>>>>');
    const resultsOut2 = await results({
      process: '90O7RFBp7M2c9TkOot4Nb5r-rbN9QMUAmcxu0Hf3K6Q',
      from: cursor,
      sort: 'ASC',
      limit: 50,
    });

    for (const element of resultsOut2.edges.reverse()) {
      cursor = element.cursor;
      console.log('Element data:', element.node.Messages);

      for (const msg of element.node.Messages) {
        console.log('Message Tags:', msg.Tags);
      }

      const messagesData = element.node.Messages.filter(e => e.Tags.length > 0 && e.Tags.some(f => f.name == 'Action' && f.value == 'Say'));
      console.log('Filtered Message Data:', messagesData);
      for (const messagesItem of messagesData) {
        const event = messagesItem.Tags.find(e => e.name == 'Event')?.value || 'Message in YOUR ROOM';
        const sendTest = event + ' : ' + messagesItem.Data;
        console.log('Captured Message:', sendTest);
        sendMessage(sendTest);
      }
    }
  } catch (error) {
    console.error('DevChatCheking error:', error);
    console.error('Error details:', error.message);
  } finally {
    setTimeout(DevChatChecking, 5000);
  }
}

function sendMessage(message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message);
    console.log('Sent message:', message);
  } else {
    console.error('WebSocket connection is not currently open.');
  }
}

DevChatChecking();
