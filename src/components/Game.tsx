// src/components/Game.tsx
import React, { useState, useCallback } from 'react';
import Canvas from './Canvas/Canvas';
import ScoreBoard from './ScoreBoard/ScoreBoard';
import PlayerSelection from './PlayerSelection/PlayerSelection';
import Controls from "./Controls/Controls";
import { PlayerSide } from '../types';
import styles from './Game.module.css';
import {useGameContext} from "../hooks/useGameContext.tsx";

const Game: React.FC = () => {
    const { updateGameState, canvasSize } = useGameContext();
    const [gameStarted, setGameStarted] = useState(false);

    const handlePlayerSideSelection = useCallback((side: PlayerSide) => {
        updateGameState(prevState => ({
            ...prevState,
            playerSide: side
        }));
        setGameStarted(true);
    }, [updateGameState]);

    const handleExit = useCallback(() => {
        setGameStarted(false);
        updateGameState(prevState => ({
            ...prevState,
            leftHero: { ...prevState.leftHero, position: { x: 50, y: canvasSize.height / 2 } },
            rightHero: { ...prevState.rightHero, position: { x: canvasSize.width - 50, y: canvasSize.height / 2 } },
            spells: [],
            score: { left: 0, right: 0 }
        }));
    }, [updateGameState, canvasSize]);

    if (!gameStarted) {
        return <PlayerSelection onSelectSide={handlePlayerSideSelection} />;
    }

    return (
        <div className={styles.game}>
            <ScoreBoard handleExit={handleExit} />
            <Canvas />
            <Controls />
        </div>
    );
};

export default Game;