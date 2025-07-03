import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { GameManager } from './gameLogic.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Store multiple lobbies
const lobbies = new Map();
// Store connected clients with their lobby info
const clients = new Map();

// Helper function to generate a random lobby code
function generateLobbyCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Helper function to create a new lobby
function createLobby(lobbyCode) {
  const gameManager = new GameManager();
  
  // Set up game event listeners for this lobby
  gameManager.on('hintRevealed', () => {
    broadcastToLobby(lobbyCode, {
      type: 'GAME_UPDATE',
      payload: gameManager.getGameState()
    });
  });

  gameManager.on('roundEnd', () => {
    broadcastToLobby(lobbyCode, {
      type: 'ROUND_END',
      payload: gameManager.getGameState()
    });
  });

  gameManager.on('newRound', () => {
    broadcastToLobby(lobbyCode, {
      type: 'NEW_ROUND',
      payload: gameManager.getGameState()
    });
  });

  gameManager.on('finalResults', () => {
    broadcastToLobby(lobbyCode, {
      type: 'FINAL_RESULTS',
      payload: gameManager.getFinalResults()
    });
  });

  gameManager.on('gameReset', () => {
    broadcastToLobby(lobbyCode, {
      type: 'GAME_RESET',
      payload: gameManager.getLobbyState()
    });
  });

  gameManager.on('gameUpdate', () => {
    broadcastToLobby(lobbyCode, {
      type: 'GAME_UPDATE',
      payload: gameManager.getGameState()
    });
  });

  lobbies.set(lobbyCode, gameManager);
  return gameManager;
}

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  console.log('New client connected:', clientId);
  
  clients.set(clientId, { ws, lobbyCode: null });
  
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
    const clientData = clients.get(clientId);
    if (clientData && clientData.lobbyCode) {
      const gameManager = lobbies.get(clientData.lobbyCode);
      if (gameManager) {
        gameManager.removePlayer(clientId);
        broadcastLobbyUpdate(clientData.lobbyCode);
        
        // Remove empty lobbies
        if (gameManager.players.size === 0) {
          lobbies.delete(clientData.lobbyCode);
          console.log('Removed empty lobby:', clientData.lobbyCode);
        }
      }
    }
    clients.delete(clientId);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleMessage(clientId, data) {
  const { type, payload } = data;
  const clientData = clients.get(clientId);
  
  console.log('Received message:', type, 'from client:', clientId, 'payload:', payload);
  
  if (!clientData) {
    console.log('No client data found for:', clientId);
    return;
  }
  
  switch (type) {
    case 'CREATE_LOBBY':
      const newLobbyCode = generateLobbyCode();
      const newGameManager = createLobby(newLobbyCode);
      newGameManager.addPlayer(clientId, payload.playerName);
      
      clientData.lobbyCode = newLobbyCode;
      
      console.log('LOBBY CREATED:', newLobbyCode, 'by player:', payload.playerName);
      console.log('Players in new lobby:', newGameManager.players.size);
      
      sendToClient(clientId, {
        type: 'LOBBY_CREATED',
        payload: { lobbyCode: newLobbyCode }
      });
      
      broadcastLobbyUpdate(newLobbyCode);
      break;
      
    case 'JOIN_LOBBY':
      const { lobbyCode, playerName } = payload;
      let joinGameManager = lobbies.get(lobbyCode);
      
      console.log('JOIN_LOBBY attempt:', playerName, 'trying to join', lobbyCode);
      
      if (!joinGameManager) {
        console.log('Lobby not found:', lobbyCode);
        sendToClient(clientId, {
          type: 'ERROR',
          payload: { message: 'Lobby not found' }
        });
        return;
      }
      
      // Check if lobby is full or game is in progress
      if (joinGameManager.players.size >= 8) {
        console.log('Lobby is full:', lobbyCode);
        sendToClient(clientId, {
          type: 'ERROR',
          payload: { message: 'Lobby is full' }
        });
        return;
      }
      
      if (joinGameManager.gameState.status !== 'LOBBY') {
        console.log('Game already in progress in lobby:', lobbyCode);
        sendToClient(clientId, {
          type: 'ERROR',
          payload: { message: 'Game is already in progress' }
        });
        return;
      }
      
      joinGameManager.addPlayer(clientId, playerName);
      clientData.lobbyCode = lobbyCode;
      
      console.log('Player', playerName, 'successfully joined lobby:', lobbyCode);
      console.log('Players in lobby now:', joinGameManager.players.size);
      
      sendToClient(clientId, {
        type: 'LOBBY_JOINED',
        payload: { lobbyCode }
      });
      
      broadcastLobbyUpdate(lobbyCode);
      break;
      
    case 'START_GAME':
      if (!clientData.lobbyCode) {
        console.log('START_GAME: Client has no lobby code');
        return;
      }
      const startGameManager = lobbies.get(clientData.lobbyCode);
      if (startGameManager) {
        console.log('START_GAME: Checking if can start game for lobby', clientData.lobbyCode);
        console.log('Players in lobby:', startGameManager.players.size);
        console.log('Game status:', startGameManager.gameState.status);
        console.log('Can start game:', startGameManager.canStartGame());
        
        if (startGameManager.canStartGame()) {
          console.log('Starting game for lobby:', clientData.lobbyCode);
          startGameManager.startGame();
          broadcastGameStart(clientData.lobbyCode);
        } else {
          console.log('Cannot start game - conditions not met');
        }
      } else {
        console.log('START_GAME: No game manager found for lobby', clientData.lobbyCode);
      }
      break;
      
    case 'SUBMIT_GUESS':
      if (!clientData.lobbyCode) return;
      const guessGameManager = lobbies.get(clientData.lobbyCode);
      if (guessGameManager) {
        const result = guessGameManager.submitGuess(clientId, payload.guess);
        if (result.correct) {
          broadcastCorrectGuess(clientData.lobbyCode, clientId, payload.guess, result.points);
        } else {
          sendToClient(clientId, {
            type: 'GUESS_FEEDBACK',
            payload: { correct: false, guess: payload.guess }
          });
        }
      }
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
}

function broadcastLobbyUpdate(lobbyCode) {
  const gameManager = lobbies.get(lobbyCode);
  if (!gameManager) return;
  
  const lobbyState = gameManager.getLobbyState();
  broadcastToLobby(lobbyCode, {
    type: 'LOBBY_UPDATE',
    payload: lobbyState
  });
}

function broadcastGameStart(lobbyCode) {
  const gameManager = lobbies.get(lobbyCode);
  if (!gameManager) return;
  
  const gameState = gameManager.getGameState();
  broadcastToLobby(lobbyCode, {
    type: 'GAME_START',
    payload: gameState
  });
}

function broadcastCorrectGuess(lobbyCode, playerId, guess, points) {
  const gameManager = lobbies.get(lobbyCode);
  if (!gameManager) return;
  
  const gameState = gameManager.getGameState();
  broadcastToLobby(lobbyCode, {
    type: 'CORRECT_GUESS',
    payload: { playerId, guess, points, gameState }
  });
}

function broadcastToLobby(lobbyCode, message) {
  clients.forEach((clientData, clientId) => {
    if (clientData.lobbyCode === lobbyCode && clientData.ws.readyState === clientData.ws.OPEN) {
      clientData.ws.send(JSON.stringify(message));
    }
  });
}

function sendToClient(clientId, message) {
  const clientData = clients.get(clientId);
  if (clientData && clientData.ws && clientData.ws.readyState === clientData.ws.OPEN) {
    clientData.ws.send(JSON.stringify(message));
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Multi-lobby word guessing game server started');
});