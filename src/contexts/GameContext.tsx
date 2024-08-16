// src/contexts/GameContext.tsx

import React, { createContext, useState } from 'react';
import { GameContextType, GameState, PlayerSide, Size } from '../types';

const initialGameState: GameState = {
    leftHero: {
        position: { x: 50, y: 300 },
        size: { width: 50, height: 50 },
        color: 'blue',
        spellColor: 'lightblue',
        speed: 5,
        fireRate: 1,
    },
    rightHero: {
        position: { x: 700, y: 300 },
        size: { width: 50, height: 50 },
        color: 'red',
        spellColor: 'pink',
        speed: 5,
        fireRate: 1,
    },
    spells: [],
    score: { left: 0, right: 0 },
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [playerSide, setPlayerSide] = useState<PlayerSide>('left');
    const canvasSize: Size = { width: 800, height: 600 };

    const updateGameState = (newState: Partial<GameState>) => {
        setGameState(prevState => ({ ...prevState, ...newState }));
    };

    return (
        <GameContext.Provider value={{ gameState, updateGameState, playerSide, setPlayerSide, canvasSize }}>
            {children}
        </GameContext.Provider>
    );
};