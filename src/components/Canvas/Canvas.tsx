// src/components/Canvas/Canvas.tsx
import React from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useGameContext } from '../../contexts/GameContext';
import styles from './Canvas.module.css';

const Canvas: React.FC = () => {
    const { gameState, canvasSize } = useGameContext();
    const canvasRef = useCanvas(gameState.playerSide);

    return (
        <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={canvasSize.width}
            height={canvasSize.height}
        />
    );
};

export default Canvas;