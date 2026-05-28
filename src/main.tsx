import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { WebGLSceneProvider } from './contexts/WebGLSceneContext';
import './index.css';

function hideBootSplash() {
  const splash = document.getElementById('boot-splash');
  if (!splash) return;
  splash.classList.add('is-hidden');
  window.setTimeout(() => splash.remove(), 260);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebGLSceneProvider>
      <App />
    </WebGLSceneProvider>
  </StrictMode>,
);

requestAnimationFrame(() => {
  requestAnimationFrame(hideBootSplash);
});
