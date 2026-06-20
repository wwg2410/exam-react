import React, { useState } from 'react';
import './App.css';
import { Home } from './pages/Home';
import { Game } from './pages/Game';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleStartGame = () => {
    setCurrentPage('game');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <>
      {currentPage === 'home' && <Home onStartGame={handleStartGame} />}
      {currentPage === 'game' && <Game />}
    </>
  );
}