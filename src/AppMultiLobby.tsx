import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocketSafe';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [currentLobbyCode, setCurrentLobbyCode] = useState('');
  const [error, setError] = useState('');
  const [screen, setScreen] = useState('HOME'); // HOME, LOBBY, PLAYING, ROUND_END, FINAL_RESULTS

  // Game state
  const [lobbyData, setLobbyData] = useState({ players: [], canStart: false, status: 'LOBBY' });
  const [gameData, setGameData] = useState<any>(null);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [guessFeedback, setGuessFeedback] = useState<string>('');
  const [guess, setGuess] = useState('');

  // WebSocket connection
  const { ws, sendMessage, connectionState, error: wsError } = useWebSocket(
    'ws://localhost:3001', 
    {
      onLobbyCreated: (data: any) => {
        console.log('Lobby created:', data);
        setCurrentLobbyCode(data.lobbyCode);
        setScreen('LOBBY');
        setError('');
      },
      onLobbyJoined: (data: any) => {
        console.log('Lobby joined:', data);
        setCurrentLobbyCode(data.lobbyCode);
        setScreen('LOBBY');
        setError('');
      },
      onLobbyUpdate: (data: any) => {
        console.log('Lobby update:', data);
        setLobbyData(data);
      },
      onGameStart: (data: any) => {
        console.log('Game start:', data);
        setGameData(data);
        setScreen('PLAYING');
      },
      onGameUpdate: (data: any) => {
        setGameData(data);
      },
      onRoundEnd: (data: any) => {
        setGameData(data);
        setScreen('ROUND_END');
      },
      onNewRound: (data: any) => {
        setGameData(data);
        setScreen('PLAYING');
      },
      onFinalResults: (data: any) => {
        setFinalResults(data);
        setScreen('FINAL_RESULTS');
      },
      onGameReset: (data: any) => {
        setLobbyData(data);
        setScreen('LOBBY');
        setGameData(null);
        setFinalResults(null);
      },
      onCorrectGuess: (data: any) => {
        setGameData(data.gameState);
        setGuessFeedback(`Correct! +${data.points} points`);
        setTimeout(() => setGuessFeedback(''), 3000);
      },
      onGuessFeedback: (data: any) => {
        setGuessFeedback(`Incorrect: "${data.guess}"`);
        setTimeout(() => setGuessFeedback(''), 3000);
      },
      onError: (data: any) => {
        setError(data.message);
      }
    }
  );

  const createLobby = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setError('');
    sendMessage('CREATE_LOBBY', { playerName: playerName.trim() });
  };

  const joinLobby = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!lobbyCode.trim()) {
      setError('Please enter a lobby code');
      return;
    }
    
    setError('');
    sendMessage('JOIN_LOBBY', { 
      playerName: playerName.trim(),
      lobbyCode: lobbyCode.trim().toUpperCase()
    });
  };

  const startGame = () => {
    sendMessage('START_GAME', {});
  };

  const submitGuess = () => {
    if (!guess.trim()) return;
    
    sendMessage('SUBMIT_GUESS', { guess: guess.trim() });
    setGuess('');
  };

  const leaveLobby = () => {
    setScreen('HOME');
    setCurrentLobbyCode('');
    setLobbyData({ players: [], canStart: false, status: 'LOBBY' });
    setGameData(null);
    setFinalResults(null);
    setGuessFeedback('');
    setError('');
  };

  // Connection status indicator
  const connectionStatus = connectionState === 'connected' ? '🟢 Connected' : 
                          connectionState === 'connecting' ? '🟡 Connecting...' : 
                          '🔴 Disconnected';

  if (screen === 'HOME') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Word Guessing Game
            </h1>
            <p className="text-xl text-gray-300 mb-2">Guess words from hints with friends!</p>
            <p className="text-sm text-gray-400">{connectionStatus}</p>
          </div>

          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                disabled={connectionState !== 'connected'}
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={createLobby}
                disabled={connectionState !== 'connected' || !playerName.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              >
                Create New Lobby
              </button>

              <div className="text-center text-gray-300">or</div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter lobby code"
                  disabled={connectionState !== 'connected'}
                />
                <button
                  onClick={joinLobby}
                  disabled={connectionState !== 'connected' || !playerName.trim() || !lobbyCode.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Join Lobby
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {wsError && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                Connection Error: {wsError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'LOBBY') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Game Lobby</h1>
              <div className="text-xl text-yellow-400 font-mono bg-black/30 rounded-lg py-2 px-4 inline-block">
                Lobby Code: {currentLobbyCode}
              </div>
              <p className="text-gray-300 mt-2">Share this code with friends to join!</p>
              <button
                onClick={leaveLobby}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors"
              >
                Leave Lobby
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Players ({lobbyData.players.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {lobbyData.players.map((player: any, index: number) => (
                  <div key={player.id} className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-lg font-semibold">{player.name}</div>
                    <div className="text-sm text-gray-300">
                      {index === 0 ? '👑 Host' : 'Player'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                {lobbyData.canStart ? (
                  <button
                    onClick={startGame}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Start Game
                  </button>
                ) : (
                  <div className="text-gray-400">
                    Need at least 2 players to start
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'PLAYING' || screen === 'ROUND_END') {
    const isRoundEnd = screen === 'ROUND_END';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Game Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Round {gameData?.round || 1}</h1>
              <div className="text-2xl text-yellow-400">
                {isRoundEnd ? 'Round Complete!' : `Time: ${gameData?.timeLeft || 0}s`}
              </div>
              <button
                onClick={leaveLobby}
                className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors"
              >
                Leave Game
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Game Area */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    {isRoundEnd ? `The word was: "${gameData?.currentWord}"` : 'Hints'}
                  </h2>
                  
                  <div className="space-y-4">
                    {gameData?.currentHints?.map((hint: string, index: number) => (
                      <div key={index} className="bg-white/20 rounded-lg p-4">
                        <span className="text-yellow-400 font-bold">Hint {index + 1}:</span> {hint}
                      </div>
                    )) || []}
                  </div>
                </div>

                {/* Guess Input */}
                {!isRoundEnd && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                        className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your guess..."
                        disabled={connectionState !== 'connected'}
                      />
                      <button
                        onClick={submitGuess}
                        disabled={!guess.trim() || connectionState !== 'connected'}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                      >
                        Guess
                      </button>
                    </div>
                    
                    {guessFeedback && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        guessFeedback.includes('Correct') 
                          ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                          : 'bg-red-500/20 border border-red-500/50 text-red-200'
                      }`}>
                        {guessFeedback}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold mb-6 text-center">Leaderboard</h2>
                  
                  <div className="space-y-3">
                    {gameData?.players?.map((player: any, index: number) => (
                      <div key={player.id} className="bg-white/20 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold">#{index + 1}</span>
                          <span className="font-semibold">{player.name}</span>
                          {player.hasGuessed && <span className="text-green-400">✓</span>}
                        </div>
                        <div className="text-xl font-bold text-yellow-400">{player.score}</div>
                      </div>
                    )) || []}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'FINAL_RESULTS') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Game Complete!
            </h1>

            {finalResults?.winner && (
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-yellow-400 mb-2">🏆 Winner!</h2>
                <p className="text-2xl">{finalResults.winner.name}</p>
                <p className="text-xl text-gray-300">Final Score: {finalResults.winner.score}</p>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <h3 className="text-2xl font-bold mb-6">Final Standings</h3>
              <div className="space-y-4">
                {finalResults?.players?.map((player: any, index: number) => (
                  <div key={player.id} className="bg-white/20 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                      <span className="text-xl font-semibold">{player.name}</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">{player.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">Returning to lobby in a few seconds...</p>
              <button
                onClick={leaveLobby}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-105"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
