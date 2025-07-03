import { useState, useEffect, useRef } from 'react';

export function useWebSocket(url: string, handlers: any) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const [error, setError] = useState<string | null>(null);
  const handlersRef = useRef(handlers);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    let websocket: WebSocket;
    
    const connect = () => {
      try {
        console.log('Attempting to connect to WebSocket:', url);
        setConnectionState('connecting');
        setError(null);
        
        websocket = new WebSocket(url);
        
        websocket.onopen = () => {
          console.log('Connected to WebSocket server');
          setWs(websocket);
          setConnectionState('connected');
          setError(null);
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
          setConnectionState('disconnected');
          
          // Try to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };
        
        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Failed to connect to game server');
          setConnectionState('error');
        };
        
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setError('Failed to create WebSocket connection');
        setConnectionState('error');
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [url]);

  const sendMessage = (type: string, payload?: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type, payload }));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not connected, cannot send message:', type);
    }
  };

  return { ws, sendMessage, connectionState, error };
}
