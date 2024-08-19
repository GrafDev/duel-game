import React, { useEffect } from 'react';
import styles from './ScoreBoard.module.css';
import {GameState} from "../../types";

interface ScoreBoardProps {
    gameState: GameState;
    handleExit: () => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({gameState, handleExit }) => {

    useEffect(() => {
        console.log(`Игрок играет за ${gameState.playerSide === 'left' ? 'левую' : 'правую'} сторону`);
    }, [gameState.playerSide]);

    const leftLabel = gameState.playerSide === 'left' ? 'Кожаный мешок' : 'Железяка';
    const rightLabel = gameState.playerSide === 'right' ? 'Кожаный мешок' : 'Железяка';

    return (
        <div className={styles.scoreboard}>
            <div className={styles.score}>
                <p>{leftLabel}: {gameState.score.left}</p>
            </div>
            <button className={styles.exit_button} onClick={handleExit}>Exit</button>
            <div className={styles.score}>
                <p>{rightLabel}: {gameState.score.right}</p>
            </div>
        </div>
    );
};

export default ScoreBoard;
