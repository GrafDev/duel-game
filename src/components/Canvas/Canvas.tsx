// src/components/Canvas/Canvas.tsx
import React, { memo } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useGameContext } from '../../hooks/useGameContext';
import styles from './Canvas.module.css';

const Canvas: React.FC = memo(() => {
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
});

Canvas.displayName = 'Canvas';

export default Canvas;
