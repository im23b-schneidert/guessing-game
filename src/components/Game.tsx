import React, { useState, useEffect } from 'react';
import { GameTimer } from './GameTimer';
import { HintDisplay } from './HintDisplay';
import { GuessInput } from './GuessInput';
import { Leaderboard } from './Leaderboard';
import { Trophy, Clock } from 'lucide-react';

interface GameProps {
  gameData: any;
  onSubmitGuess: (guess: string) => void;
  playerName: string;
  gameState: string;
}

export function Game({ gameData, onSubmitGuess, playerName, gameState }: GameProps) {
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [hasGuessed, setHasGuessed] = useState(false);

  useEffect(() => {
    const currentPlayer = gameData.players.find((p: any) => p.name === playerName);
    if (currentPlayer) {
      setHasGuessed(currentPlayer.hasGuessed);
    }
  }, [gameData, playerName]);

  const handleGuess = (guess: string) => {
    if (!hasGuessed && gameState === 'PLAYING') {
      onSubmitGuess(guess);
      setFeedback({ message: `You guessed: ${guess}`, type: null });
    }
  };

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Word Master</h1>
          <p className="text-white/80">Round {gameData.round} of {gameData.maxRounds}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            <GameTimer 
              timeLeft={gameData.timeLeft} 
              status={gameState}
            />
            
            <HintDisplay 
              hints={gameData.currentHints || []}
              status={gameState}
              currentWord={gameState === 'ROUND_END' ? gameData.currentWord : null}
            />
            
            <GuessInput 
              onSubmitGuess={handleGuess}
              disabled={hasGuessed || gameState !== 'PLAYING'}
              hasGuessed={hasGuessed}
            />
            
            {feedback.message && (
              <div className={`p-4 rounded-lg text-center ${
                feedback.type === 'success' ? 'bg-green-500/20 text-green-100' :
                feedback.type === 'error' ? 'bg-red-500/20 text-red-100' :
                'bg-blue-500/20 text-blue-100'
              }`}>
                {feedback.message}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard 
              players={gameData.players || []}
              currentPlayer={playerName}
            />
          </div>
        </div>

        {gameState === 'ROUND_END' && (
          <div className="text-center mt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Round {gameData.round} Complete!</h2>
              <p className="text-white/80 mb-4">
                The word was: <span className="font-bold text-yellow-400">{gameData.currentWord}</span>
              </p>
              {gameData.round < gameData.maxRounds ? (
                <div className="flex items-center justify-center text-white/70">
                  <Clock className="w-5 h-5 mr-2" />
                  <p>Next round starting soon...</p>
                </div>
              ) : (
                <p className="text-white/70">Calculating final results...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}