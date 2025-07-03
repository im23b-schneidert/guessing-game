import React, { useState } from 'react';
import { Users, Play, Crown } from 'lucide-react';

interface LobbyProps {
  players: Array<{ id: string; name: string; score: number }>;
  canStart: boolean;
  onJoinLobby: (name: string) => void;
  onStartGame: () => void;
  playerName: string;
}

export function Lobby({ players, canStart, onJoinLobby, onStartGame, playerName }: LobbyProps) {
  const [name, setName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoinLobby(name.trim());
      setHasJoined(true);
    }
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Word Master</h1>
            <p className="text-white/80">Join the ultimate word guessing challenge!</p>
          </div>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                Enter your name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
            >
              Join Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Game Lobby</h1>
          <p className="text-white/80">Waiting for players to join...</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Players ({players.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{player.name}</div>
                  <div className="text-sm text-white/70">Score: {player.score}</div>
                </div>
                {player.name === playerName && (
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          {canStart ? (
            <button
              onClick={onStartGame}
              className="inline-flex items-center bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </button>
          ) : (
            <div className="text-white/70">
              Need at least 2 players to start the game
            </div>
          )}
        </div>
      </div>
    </div>
  );
}