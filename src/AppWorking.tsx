import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocketSafe';
// import { Lobby } from './components/Lobby';
// import { Game } from './components/Game';
// import { FinalResults } from './components/FinalResults';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  // Game state
  const [gameState, setGameState] = useState('LOBBY');
  const [lobbyData, setLobbyData] = useState({ players: [], canStart: false, status: 'LOBBY' });
  const [gameData, setGameData] = useState<any>(null);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [guessFeedback, setGuessFeedback] = useState<string>('');

  // WebSocket connection (always enabled)
  const { ws, sendMessage, connectionState, error: wsError } = useWebSocket(
    'ws://localhost:3001', 
    {
      onLobbyUpdate: (data: any) => {
        console.log('Lobby update:', data);
        setLobbyData(data);
        setGameState(data.status);
      },
      onGameStart: (data: any) => {
        console.log('Game start:', data);
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
        setGuessFeedback('🎉 Correct! Great job!');
        setTimeout(() => setGuessFeedback(''), 3000);
      },
      onGuessFeedback: (data: any) => {
        if (data.correct) {
          setGuessFeedback(`🎉 Correct! +${data.points} points!`);
        } else {
          setGuessFeedback('❌ Try again!');
        }
        setTimeout(() => setGuessFeedback(''), 3000);
      }
    }
  );

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

  console.log('App rendering, ws state:', connectionState, 'game state:', gameState);

  // Main game logic - render based on game state
  // Show connection error if there's an issue, but don't block the UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {gameState === 'LOBBY' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Game Lobby</h1>
              
              {/* Connection status indicator */}
              {connectionState === 'connecting' && (
                <div className="mb-4 p-3 bg-yellow-500/20 text-yellow-100 rounded-lg">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                    Connecting to server...
                  </div>
                </div>
              )}
              
              {connectionState === 'error' && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-100 rounded-lg">
                  <div className="text-sm">
                    Connection failed. Please check if the server is running.
                    {wsError && <div className="mt-1 text-xs">{wsError}</div>}
                  </div>
                </div>
              )}
              
              <p className="text-white/80 mb-6">Players: {lobbyData.players.length}</p>
              
              {/* Show current players */}
              {lobbyData.players.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg text-white mb-3">Current Players:</h3>
                  <div className="space-y-2">
                    {lobbyData.players.map((player: any, index: number) => (
                      <div key={player.id} className="bg-white/10 p-2 rounded flex justify-between">
                        <span className="text-white">{player.name}</span>
                        <span className="text-white/60">{player.name === playerName ? '(You)' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!playerName && (
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 text-red-100 p-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Enter your name"
                    disabled={connectionState !== 'connected'}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                      connectionState !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          handleJoinLobby(input.value.trim());
                        } else {
                          setError('Please enter a valid name');
                        }
                      }
                    }}
                  />
                  <p className="text-white/60 text-sm">
                    {connectionState === 'connected' 
                      ? 'Press Enter to join the game' 
                      : 'Waiting for connection...'}
                  </p>
                </div>
              )}
              
              {playerName && (
                <div className="space-y-4">
                  <p className="text-white">Welcome, {playerName}!</p>
                  {lobbyData.canStart && (
                    <button 
                      onClick={handleStartGame}
                      className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-200"
                    >
                      Start Game
                    </button>
                  )}
                  {!lobbyData.canStart && (
                    <p className="text-white/70">Waiting for more players...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {(gameState === 'PLAYING' || gameState === 'ROUND_END') && gameData && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Game Area */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Word Master</h1>
                    <p className="text-white/80 mb-4">Round {gameData.round} of {gameData.maxRounds}</p>
                    <p className="text-white/80 mb-6">Time left: {gameData.timeLeft}s</p>
                    
                    {gameData.currentHints && (
                      <div className="mb-6">
                        <h3 className="text-xl text-white mb-4">Hints:</h3>
                        <div className="space-y-2">
                          {gameData.currentHints.map((hint: string, index: number) => (
                            <div key={index} className="bg-white/5 p-3 rounded-lg">
                              <p className="text-white/90">• {hint}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {gameState === 'PLAYING' && (
                      <div className="space-y-4">
                        {guessFeedback && (
                          <div className={`p-3 rounded-lg text-center ${
                            guessFeedback.includes('Correct') || guessFeedback.includes('🎉') 
                              ? 'bg-green-500/20 text-green-100' 
                              : 'bg-red-500/20 text-red-100'
                          }`}>
                            {guessFeedback}
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Enter your guess"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                handleSubmitGuess(input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <p className="text-white/60 text-sm">Press Enter to submit your guess</p>
                      </div>
                    )}
                    
                    {gameState === 'ROUND_END' && (
                      <div className="bg-green-500/20 text-green-100 p-4 rounded-lg">
                        <p className="text-xl font-bold mb-2">Round Complete!</p>
                        <p>The word was: <strong className="text-yellow-300">{gameData.currentWord}</strong></p>
                        <p className="text-sm mt-2">Next round starting soon...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4 text-center">🏆 Leaderboard</h2>
                  <div className="space-y-3">
                    {gameData.players && gameData.players.length > 0 ? (
                      gameData.players.map((player: any, index: number) => (
                        <div 
                          key={player.id} 
                          className={`p-3 rounded-lg flex justify-between items-center ${
                            player.name === playerName 
                              ? 'bg-yellow-500/20 border border-yellow-500/30' 
                              : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`text-lg font-bold ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                              index === 2 ? 'text-orange-400' : 'text-white'
                            }`}>
                              {index + 1}.
                            </span>
                            <div>
                              <p className={`font-semibold ${
                                player.name === playerName ? 'text-yellow-200' : 'text-white'
                              }`}>
                                {player.name}
                                {player.name === playerName && ' (You)'}
                              </p>
                              <p className="text-sm text-white/70">
                                {player.hasGuessed ? '✅ Guessed' : '⏳ Guessing...'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">{player.score}</p>
                            <p className="text-xs text-white/60">points</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/60 text-center">No players found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {gameState === 'FINAL_RESULTS' && finalResults && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">Game Over!</h1>
              <p className="text-white/80 mb-6">Final Results</p>
              {finalResults.winner && (
                <p className="text-yellow-400 text-xl mb-4">🏆 Winner: {finalResults.winner.name}</p>
              )}
              <div className="space-y-2 mb-6">
                {finalResults.players.map((player: any, index: number) => (
                  <div key={player.id} className="flex justify-between text-white">
                    <span>{index + 1}. {player.name}</span>
                    <span>{player.score} points</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
