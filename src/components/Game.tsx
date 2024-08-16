import React, {useState, useEffect} from 'react';
import {useGameContext} from '../hooks/useGameContext';
import Canvas from './Canvas/Canvas.tsx';
import ScoreBoard from './ScoreBoard/ScoreBoard.tsx';
import PlayerSelection from './PlayerSelection/PlayerSelection.tsx';
import {PlayerSide} from '../types';
import Controls from "./Controls/Controls.tsx";
import styles from './Game.module.css';

const Game: React.FC = () => {
    const {gameState, updateGameState, canvasSize} = useGameContext();
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (!gameStarted) return;

        const gameLoop = () => {
            // ... (keep the existing game loop logic here)
        };

        const intervalId = setInterval(gameLoop, 1000 / 60); // 60 FPS

        return () => clearInterval(intervalId);
    }, [gameState, updateGameState, canvasSize, gameStarted]);

    const handlePlayerSideSelection = (side: PlayerSide) => {
        updateGameState({playerSide: side});
        setGameStarted(true);
    };

    const handleExit = () => {
        setGameStarted(false);
        updateGameState({
            leftHero: {...gameState.leftHero, position: {x: 50, y: canvasSize.height / 2}},
            rightHero: {...gameState.rightHero, position: {x: canvasSize.width - 50, y: canvasSize.height / 2}},
            spells: [],
            score: {left: 0, right: 0}
        });
    };

    if (!gameStarted) {
        return <PlayerSelection onSelectSide={handlePlayerSideSelection}/>;
    }

    return (
        <div className="game">
            <ScoreBoard handleExit={handleExit}/>
            <div className={styles.canvas}>
                <Canvas/>
            </div>
            <Controls/>
        </div>
    );
};

export default Game;