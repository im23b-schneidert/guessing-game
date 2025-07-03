import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

interface GuessInputProps {
  onSubmitGuess: (guess: string) => void;
  disabled: boolean;
  hasGuessed: boolean;
}

export function GuessInput({ onSubmitGuess, disabled, hasGuessed }: GuessInputProps) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && !disabled) {
      onSubmitGuess(guess.trim());
      setGuess('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center mb-4">
        <Send className="w-6 h-6 text-blue-400 mr-2" />
        <h2 className="text-xl font-bold text-white">Your Guess</h2>
      </div>
      
      {hasGuessed ? (
        <div className="flex items-center justify-center py-8">
          <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
          <span className="text-green-400 font-semibold text-lg">
            You've already guessed this round!
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              disabled={disabled}
            />
            <button
              type="submit"
              disabled={disabled || !guess.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}