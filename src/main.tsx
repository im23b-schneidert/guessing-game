import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppWorking.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
