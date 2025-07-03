import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  players: Array<{ id: string; name: string; score: number; hasGuessed: boolean }>;
  currentPlayer: string;
}

export function Leaderboard({ players, currentPlayer }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Award className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-white/60 font-bold">{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-orange-500';
      case 1: return 'from-gray-300 to-gray-400';
      case 2: return 'from-orange-400 to-red-500';
      default: return 'from-blue-400 to-purple-500';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
      </div>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
              player.name === currentPlayer 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3">
              {getRankIcon(index)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-white font-semibold truncate">{player.name}</span>
                {player.name === currentPlayer && (
                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    You
                  </span>
                )}
                {player.hasGuessed && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    Guessed
                  </span>
                )}
              </div>
              <div className="text-white/70 text-sm">{player.score} points</div>
            </div>
            
            {index < 3 && (
              <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${getRankColor(index)}`} />
            )}
          </div>
        ))}
        
        {sortedPlayers.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No players yet</p>
          </div>
        )}
      </div>
    </div>
  );
}