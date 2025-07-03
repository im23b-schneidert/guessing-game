import React from 'react';
import { Lightbulb, Eye } from 'lucide-react';

interface HintDisplayProps {
  hints: string[];
  status: string;
  currentWord?: string;
}

export function HintDisplay({ hints, status, currentWord }: HintDisplayProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <Lightbulb className="w-6 h-6 text-yellow-400 mr-2" />
        <h2 className="text-xl font-bold text-white">Hints</h2>
      </div>
      
      <div className="space-y-3">
        {hints.map((hint, index) => (
          <div 
            key={index}
            className="flex items-start p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <p className="text-white/90 leading-relaxed">{hint}</p>
          </div>
        ))}
        
        {hints.length === 0 && status === 'PLAYING' && (
          <div className="text-center py-8 text-white/60">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>First hint coming soon...</p>
          </div>
        )}
      </div>
      
      {currentWord && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
          <div className="text-center">
            <p className="text-white/80 mb-2">The answer was:</p>
            <p className="text-2xl font-bold text-white">{currentWord}</p>
          </div>
        </div>
      )}
    </div>
  );
}