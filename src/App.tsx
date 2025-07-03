import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { FinalResults } from './components/FinalResults';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const [gameState, setGameState] = useState('LOBBY');
  const [playerName, setPlayerName] = useState('');
  const [lobbyData, setLobbyData] = useState({ players: [], canStart: false });
  const [gameData, setGameData] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  const { ws, sendMessage } = useWebSocket('ws://localhost:3001', {
    onLobbyUpdate: (data) => {
      setLobbyData(data);
      setGameState(data.status);
    },
    onGameStart: (data) => {
      setGameData(data);
      setGameState('PLAYING');
    },
    onGameUpdate: (data) => {
      setGameData(data);
    },
    onRoundEnd: (data) => {
      setGameData(data);
      setGameState('ROUND_END');
    },
    onNewRound: (data) => {
      setGameData(data);
      setGameState('PLAYING');
    },
    onFinalResults: (data) => {
      setFinalResults(data);
      setGameState('FINAL_RESULTS');
    },
    onGameReset: (data) => {
      setLobbyData(data);
      setGameState('LOBBY');
      setGameData(null);
      setFinalResults(null);
    },
    onCorrectGuess: (data) => {
      setGameData(data.gameState);
    }
  });

  const handleJoinLobby = (name) => {
    setPlayerName(name);
    sendMessage('JOIN_LOBBY', { playerName: name });
  };

  const handleStartGame = () => {
    sendMessage('START_GAME');
  };

  const handleSubmitGuess = (guess) => {
    sendMessage('SUBMIT_GUESS', { guess });
  };

  if (!ws) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Connecting to game server...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {gameState === 'LOBBY' && (
        <Lobby
          players={lobbyData.players}
          canStart={lobbyData.canStart}
          onJoinLobby={handleJoinLobby}
          onStartGame={handleStartGame}
          playerName={playerName}
        />
      )}
      {(gameState === 'PLAYING' || gameState === 'ROUND_END') && gameData && (
        <Game
          gameData={gameData}
          onSubmitGuess={handleSubmitGuess}
          playerName={playerName}
          gameState={gameState}
        />
      )}
      {gameState === 'FINAL_RESULTS' && finalResults && (
        <FinalResults
          results={finalResults}
          playerName={playerName}
        />
      )}
    </div>
  );
}

export default App;