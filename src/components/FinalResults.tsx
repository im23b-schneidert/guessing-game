import React from 'react';
import { Trophy, Medal, Award, Crown, Users } from 'lucide-react';

interface FinalResultsProps {
  results: {
    players: Array<{ id: string; name: string; score: number }>;
    winner: { id: string; name: string; score: number } | null;
  };
  playerName: string;
}

export function FinalResults({ results, playerName }: FinalResultsProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 1: return <Medal className="w-8 h-8 text-gray-300" />;
      case 2: return <Award className="w-8 h-8 text-orange-400" />;
      default: return <span className="text-2xl font-bold text-white/60">{index + 1}</span>;
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

  const getPlayerRank = () => {
    return results.players.findIndex(p => p.name === playerName) + 1;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Game Complete!</h1>
          <p className="text-white/80">Final Results</p>
        </div>

        {/* Winner Spotlight */}
        {results.winner && (
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30 mb-8">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">🎉 Winner! 🎉</h2>
              <p className="text-xl text-yellow-400 font-semibold">{results.winner.name}</p>
              <p className="text-white/80">{results.winner.score} points</p>
            </div>
          </div>
        )}

        {/* Final Leaderboard */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Users className="w-6 h-6 text-white mr-2" />
            <h2 className="text-xl font-bold text-white">Final Standings</h2>
          </div>
          
          <div className="space-y-3">
            {results.players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                  player.name === playerName 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 ring-2 ring-blue-400/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center mr-4">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="text-white font-semibold text-lg truncate">{player.name}</span>
                    {player.name === playerName && (
                      <span className="ml-3 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                    {index === 0 && (
                      <span className="ml-3 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                        Winner
                      </span>
                    )}
                  </div>
                  <div className="text-white/70">{player.score} points</div>
                </div>
                
                {index < 3 && (
                  <div className={`w-3 h-12 rounded-full bg-gradient-to-b ${getRankColor(index)}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Personal Result */}
        <div className="text-center">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/80 mb-2">Your Final Position</p>
            <p className="text-2xl font-bold text-white">
              #{getPlayerRank()} out of {results.players.length}
            </p>
          </div>
          
          <p className="text-white/60 mt-6">
            Returning to lobby in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}