import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BoardProvider } from './context/BoardContext.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </React.StrictMode>
);
