import React, { createContext, useState, useCallback, useMemo } from 'react';
import { GameState, Hero, PlayerSide, Size } from '../types';

export type GameContextType = {
    gameState: GameState;
    updateGameState: (updater: Partial<GameState> | ((prevState: GameState) => GameState)) => void;
    canvasSize: Size;
    playerSide: PlayerSide;
    setPlayerSide: (side: PlayerSide) => void;
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
    leftHero: {
        position: { x: 50, y: 300 },
        size: { width: 50, height: 50 },
        color: 'blue',
        spellColor: 'lightblue',
        speed: 5,
        fireRate: 1,
        direction: 1
    } as Hero,
    rightHero: {
        position: { x: 750, y: 300 },
        size: { width: 50, height: 50 },
        color: 'red',
        spellColor: 'orange',
        speed: 5,
        fireRate: 1,
        direction: 1
    } as Hero,
    spells: [],
    score: { left: 0, right: 0 },
    playerSide: 'left' // Добавляем это свойство в initialGameState
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [canvasSize] = useState<Size>({ width: 800, height: 600 });

    const updateGameState = useCallback((updater: Partial<GameState> | ((prevState: GameState) => GameState)) => {
        setGameState(prevState => {
            if (typeof updater === 'function') {
                return updater(prevState);
            } else {
                return { ...prevState, ...updater };
            }
        });
    }, []);

    const setPlayerSide = useCallback((side: PlayerSide) => {
        setGameState(prevState => ({ ...prevState, playerSide: side }));
    }, []);

    const contextValue = useMemo(() => ({
        gameState,
        updateGameState,
        canvasSize,
        playerSide: gameState.playerSide,
        setPlayerSide
    }), [gameState, updateGameState, canvasSize, setPlayerSide]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};
