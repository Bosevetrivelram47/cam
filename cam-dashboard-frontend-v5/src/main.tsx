// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.tsx';
import './index.css'; // Import your global styles (which includes Tailwind)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap your App with BrowserRouter to enable routing */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);