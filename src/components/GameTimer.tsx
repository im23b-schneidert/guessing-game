import React from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number;
  status: string;
}

export function GameTimer({ timeLeft, status }: GameTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 30) return 'from-green-400 to-blue-500';
    if (timeLeft > 15) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const progressPercentage = (timeLeft / 60) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="w-6 h-6 text-white mr-2" />
          <span className="text-white font-semibold">Time Remaining</span>
        </div>
        <div className={`text-2xl font-bold bg-gradient-to-r ${getTimerColor()} bg-clip-text text-transparent`}>
          {formatTime(timeLeft)}
        </div>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-3">
        <div 
          className={`h-3 rounded-full bg-gradient-to-r ${getTimerColor()} transition-all duration-1000`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {status === 'ENDED' && (
        <div className="text-center mt-4">
          <span className="text-red-300 font-semibold">Time's Up!</span>
        </div>
      )}
    </div>
  );
}