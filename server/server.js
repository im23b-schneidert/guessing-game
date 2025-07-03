import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { GameManager } from './gameLogic.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

// Store connected clients
const clients = new Map();

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  console.log('New client connected:', clientId);
  
  clients.set(clientId, ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(clientId, data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected:', clientId);
    gameManager.removePlayer(clientId);
    clients.delete(clientId);
    broadcastLobbyUpdate();
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(clientId, data) {
  const { type, payload } = data;
  
  switch (type) {
    case 'JOIN_LOBBY':
      gameManager.addPlayer(clientId, payload.playerName);
      broadcastLobbyUpdate();
      break;
      
    case 'START_GAME':
      if (gameManager.canStartGame()) {
        gameManager.startGame();
        broadcastGameStart();
      }
      break;
      
    case 'SUBMIT_GUESS':
      const result = gameManager.submitGuess(clientId, payload.guess);
      if (result.correct) {
        broadcastCorrectGuess(clientId, payload.guess, result.points);
      } else {
        sendToClient(clientId, {
          type: 'GUESS_FEEDBACK',
          payload: { correct: false, guess: payload.guess }
        });
      }
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
}

function broadcastLobbyUpdate() {
  const lobbyState = gameManager.getLobbyState();
  broadcast({
    type: 'LOBBY_UPDATE',
    payload: lobbyState
  });
}

function broadcastGameStart() {
  const gameState = gameManager.getGameState();
  broadcast({
    type: 'GAME_START',
    payload: gameState
  });
}

function broadcastCorrectGuess(playerId, guess, points) {
  const gameState = gameManager.getGameState();
  broadcast({
    type: 'CORRECT_GUESS',
    payload: { playerId, guess, points, gameState }
  });
}

function broadcastGameUpdate() {
  const gameState = gameManager.getGameState();
  broadcast({
    type: 'GAME_UPDATE',
    payload: gameState
  });
}

function broadcastRoundEnd() {
  const gameState = gameManager.getGameState();
  broadcast({
    type: 'ROUND_END',
    payload: gameState
  });
}

function broadcastNewRound() {
  const gameState = gameManager.getGameState();
  broadcast({
    type: 'NEW_ROUND',
    payload: gameState
  });
}

function broadcastFinalResults() {
  const finalResults = gameManager.getFinalResults();
  broadcast({
    type: 'FINAL_RESULTS',
    payload: finalResults
  });
}

function broadcastGameReset() {
  const lobbyState = gameManager.getLobbyState();
  broadcast({
    type: 'GAME_RESET',
    payload: lobbyState
  });
}

function broadcast(message) {
  clients.forEach((ws, clientId) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

function sendToClient(clientId, message) {
  const ws = clients.get(clientId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Set up game event listeners
gameManager.on('hintRevealed', () => {
  broadcastGameUpdate();
});

gameManager.on('roundEnd', () => {
  broadcastRoundEnd();
});

gameManager.on('newRound', () => {
  broadcastNewRound();
});

gameManager.on('finalResults', () => {
  broadcastFinalResults();
});

gameManager.on('gameReset', () => {
  broadcastGameReset();
});

gameManager.on('gameUpdate', () => {
  broadcastGameUpdate();
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});