import './App.css';
import Game from './components/Game';
import React from 'react';
import { GameProvider } from './contexts/GameContext';

const App: React.FC = () => {
    return (
        <GameProvider>
            <div className="App">
                <Game />
            </div>
        </GameProvider>
    );
};

export default App;