import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { WebGLSceneProvider } from './contexts/WebGLSceneContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebGLSceneProvider>
      <App />
    </WebGLSceneProvider>
  </StrictMode>,
);
