// src/components/ScoreBoard/ScoreBoard.tsx

import React from 'react';
import styles from './ScoreBoard.module.css';
import {useGameContext} from "../../hooks/useGameContext.tsx";

interface ScoreBoardProps {
    handleExit: () => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ handleExit }) => {
    const { gameState } = useGameContext();

    return (
        <div className={styles.scoreboard}>
            <div className={styles.score}>
                <p>Попаданий: {gameState.score.left}</p>
            </div>
            <button className={styles.exit_button} onClick={handleExit}>Exit</button>
            <div className={styles.score}>
                <p>Попаданий: {gameState.score.right}</p>
            </div>
        </div>
    );
};

export default ScoreBoard;