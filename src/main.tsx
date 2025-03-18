import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css'; // Adjust to match your actual CSS file
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}