import { EventEmitter } from 'events';
import { words } from './words.js';

export class GameManager extends EventEmitter {
  constructor() {
    super();
    this.players = new Map();
    this.gameState = {
      status: 'LOBBY', // LOBBY, PLAYING, ROUND_END, FINAL_RESULTS
      currentWord: null,
      hints: [],
      currentHint: 0,
      timeLeft: 60,
      round: 0,
      maxRounds: 5
    };
    this.gameTimer = null;
    this.hintTimer = null;
    this.roundEndTimer = null;
  }

  addPlayer(playerId, playerName) {
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      score: 0,
      hasGuessed: false,
      isConnected: true
    });
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  canStartGame() {
    return this.players.size >= 2 && this.gameState.status === 'LOBBY';
  }

  startGame() {
    if (!this.canStartGame()) return false;

    // Reset all player scores for new game
    this.players.forEach(player => {
      player.score = 0;
    });

    this.gameState.status = 'PLAYING';
    this.gameState.round = 1;
    this.startNewRound();
    return true;
  }

  startNewRound() {
    // Select random word
    const randomWord = words[Math.floor(Math.random() * words.length)];
    this.gameState.currentWord = randomWord.word;
    this.gameState.hints = randomWord.hints;
    this.gameState.currentHint = 0;
    this.gameState.timeLeft = 60;

    // Reset player states for this round
    this.players.forEach(player => {
      player.hasGuessed = false;
    });

    // Clear any existing timers
    this.clearAllTimers();

    // Start timers
    this.startGameTimer();
    this.startHintTimer();
  }

  startGameTimer() {
    this.gameTimer = setInterval(() => {
      this.gameState.timeLeft--;
      
      if (this.gameState.timeLeft <= 0) {
        this.endRound();
      } else {
        this.emit('gameUpdate');
      }
    }, 1000);
  }

  startHintTimer() {
    this.hintTimer = setInterval(() => {
      if (this.gameState.currentHint < this.gameState.hints.length - 1) {
        this.gameState.currentHint++;
        this.emit('hintRevealed');
      } else {
        clearInterval(this.hintTimer);
        this.hintTimer = null;
      }
    }, 15000);
  }

  submitGuess(playerId, guess) {
    const player = this.players.get(playerId);
    if (!player || player.hasGuessed || this.gameState.status !== 'PLAYING') {
      return { correct: false, points: 0 };
    }

    const isCorrect = guess.toLowerCase().trim() === this.gameState.currentWord.toLowerCase();
    
    if (isCorrect) {
      player.hasGuessed = true;
      const points = this.calculatePoints();
      player.score += points;
      
      // Check if all players have guessed
      const allGuessed = Array.from(this.players.values()).every(p => p.hasGuessed);
      if (allGuessed) {
        this.endRound();
      }
      
      return { correct: true, points };
    }
    
    return { correct: false, points: 0 };
  }

  calculatePoints() {
    const timeElapsed = 60 - this.gameState.timeLeft;
    
    if (timeElapsed <= 15) return 100;
    if (timeElapsed <= 30) return 75;
    if (timeElapsed <= 45) return 50;
    return 25;
  }

  endRound() {
    this.gameState.status = 'ROUND_END';
    this.clearAllTimers();
    
    this.emit('roundEnd');
    
    // Check if this was the final round
    if (this.gameState.round >= this.gameState.maxRounds) {
      // Show final results after 3 seconds
      this.roundEndTimer = setTimeout(() => {
        this.showFinalResults();
      }, 3000);
    } else {
      // Start next round after 3 seconds
      this.roundEndTimer = setTimeout(() => {
        this.gameState.round++;
        this.gameState.status = 'PLAYING';
        this.startNewRound();
        this.emit('newRound');
      }, 3000);
    }
  }

  showFinalResults() {
    this.gameState.status = 'FINAL_RESULTS';
    this.emit('finalResults');
    
    // Return to lobby after 10 seconds
    this.roundEndTimer = setTimeout(() => {
      this.resetGame();
    }, 10000);
  }

  resetGame() {
    this.gameState.status = 'LOBBY';
    this.gameState.currentWord = null;
    this.gameState.hints = [];
    this.gameState.currentHint = 0;
    this.gameState.timeLeft = 60;
    this.gameState.round = 0;
    
    // Reset all player scores but keep them in the lobby
    this.players.forEach(player => {
      player.score = 0;
      player.hasGuessed = false;
    });
    
    this.clearAllTimers();
    this.emit('gameReset');
  }

  clearAllTimers() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    if (this.hintTimer) {
      clearInterval(this.hintTimer);
      this.hintTimer = null;
    }
    
    if (this.roundEndTimer) {
      clearTimeout(this.roundEndTimer);
      this.roundEndTimer = null;
    }
  }

  getLobbyState() {
    return {
      players: Array.from(this.players.values()),
      canStart: this.canStartGame(),
      status: this.gameState.status
    };
  }

  getGameState() {
    return {
      ...this.gameState,
      players: Array.from(this.players.values()).sort((a, b) => b.score - a.score),
      currentHints: this.gameState.hints.slice(0, this.gameState.currentHint + 1)
    };
  }

  getFinalResults() {
    const sortedPlayers = Array.from(this.players.values()).sort((a, b) => b.score - a.score);
    return {
      players: sortedPlayers,
      winner: sortedPlayers[0] || null
    };
  }
}