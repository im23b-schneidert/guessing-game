import { useState, useEffect, useRef } from 'react';

export function useWebSocket(url: string, handlers: any) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const websocket = new WebSocket(url);
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;
        
        switch (type) {
          case 'LOBBY_UPDATE':
            handlersRef.current.onLobbyUpdate?.(payload);
            break;
          case 'GAME_START':
            handlersRef.current.onGameStart?.(payload);
            break;
          case 'GAME_UPDATE':
            handlersRef.current.onGameUpdate?.(payload);
            break;
          case 'ROUND_END':
            handlersRef.current.onRoundEnd?.(payload);
            break;
          case 'NEW_ROUND':
            handlersRef.current.onNewRound?.(payload);
            break;
          case 'FINAL_RESULTS':
            handlersRef.current.onFinalResults?.(payload);
            break;
          case 'GAME_RESET':
            handlersRef.current.onGameReset?.(payload);
            break;
          case 'CORRECT_GUESS':
            handlersRef.current.onCorrectGuess?.(payload);
            break;
          case 'GUESS_FEEDBACK':
            handlersRef.current.onGuessFeedback?.(payload);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setWs(null);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      websocket.close();
    };
  }, [url]);

  const sendMessage = (type: string, payload?: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  };

  return { ws, sendMessage };
}