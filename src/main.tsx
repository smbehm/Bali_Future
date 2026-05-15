import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { VideoFocusProvider } from './contexts/VideoFocusContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoFocusProvider>
      <App />
    </VideoFocusProvider>
  </StrictMode>
);
