// src/contexts/GameContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { GameState, Hero, PlayerSide } from '../types';

type GameContextType = {
    gameState: GameState;
    updateGameState: (updater: GameState | ((prevState: GameState) => GameState)) => void;
    canvasSize: { width: number; height: number };
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
    leftHero: {
        position: { x: 50, y: 300 },
        size: { width: 50, height: 50 },
        color: 'blue',
        spellColor: 'lightblue',
        speed: 5,
        fireRate: 1
    } as Hero,
    rightHero: {
        position: { x: 750, y: 300 },
        size: { width: 50, height: 50 },
        color: 'red',
        spellColor: 'orange',
        speed: 5,
        fireRate: 1
    } as Hero,
    spells: [],
    score: { left: 0, right: 0 },
    playerSide: 'left' as PlayerSide
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [canvasSize] = useState({ width: 800, height: 600 });

    const updateGameState = useCallback((updater: Partial<GameState> | ((prevState: GameState) => GameState)) => {
        setGameState(prevState => {
            if (typeof updater === 'function') {
                return updater(prevState);
            } else {
                return { ...prevState, ...updater };
            }
        });
    }, []);

    const contextValue = useMemo(() => ({
        gameState,
        updateGameState,
        canvasSize
    }), [gameState, updateGameState, canvasSize]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = (): GameContextType => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};