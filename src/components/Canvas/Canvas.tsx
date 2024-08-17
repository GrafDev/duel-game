// src/components/Canvas/Canvas.tsx
import React from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useGameContext } from '../../hooks/useGameContext';
import styles from './Canvas.module.css';

const Canvas: React.FC = () => {
    const { canvasSize } = useGameContext();
    const canvasRef = useCanvas();

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