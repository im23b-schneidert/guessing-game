import { useState } from 'react';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { FinalResults } from './components/FinalResults';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  console.log('App component is rendering...');
  
  const [gameState, setGameState] = useState('LOBBY');
  const [playerName, setPlayerName] = useState('');
  const [lobbyData, setLobbyData] = useState({ players: [], canStart: false });
  const [gameData, setGameData] = useState<any>(null);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);

  const { ws, sendMessage } = useWebSocket('ws://localhost:3001', {
    onLobbyUpdate: (data: any) => {
      setLobbyData(data);
      setGameState(data.status);
    },
    onGameStart: (data: any) => {
      setGameData(data);
      setGameState('PLAYING');
    },
    onGameUpdate: (data: any) => {
      setGameData(data);
    },
    onRoundEnd: (data: any) => {
      setGameData(data);
      setGameState('ROUND_END');
    },
    onNewRound: (data: any) => {
      setGameData(data);
      setGameState('PLAYING');
    },
    onFinalResults: (data: any) => {
      setFinalResults(data);
      setGameState('FINAL_RESULTS');
    },
    onGameReset: (data: any) => {
      setLobbyData(data);
      setGameState('LOBBY');
      setGameData(null);
      setFinalResults(null);
    },
    onCorrectGuess: (data: any) => {
      setGameData(data.gameState);
    }
  });

  const handleJoinLobby = (name: string) => {
    setPlayerName(name);
    sendMessage('JOIN_LOBBY', { playerName: name });
  };

  const handleStartGame = () => {
    sendMessage('START_GAME');
  };

  const handleSubmitGuess = (guess: string) => {
    sendMessage('SUBMIT_GUESS', { guess });
  };

  if (!ws) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">
          <div className="text-center">
            <div className="mb-4">Connecting to game server...</div>
            <div className="text-sm text-white/70">
              If this takes too long, check if the server is running on port 3001
            </div>
          </div>
        </div>
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