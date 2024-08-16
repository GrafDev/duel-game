import React from 'react';
import { PlayerSide } from '../../types';
import styles from './PlayerSelection.module.css';

interface PlayerSelectionProps {
    onSelectSide: (side: PlayerSide) => void;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({ onSelectSide }) => {
    return (
        <div className={styles.container}>
            <div className={styles.selection}>
                <h2 className={styles.title}>Choose Your Side</h2>
                <div className={styles.buttonContainer}>
                    <button
                        className={`${styles.button} ${styles.left}`}
                        onClick={() => onSelectSide('left')}
                    >
                        Play as Left Hero
                    </button>
                    <button
                        className={`${styles.button} ${styles.right}`}
                        onClick={() => onSelectSide('right')}
                    >
                        Play as Right Hero
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerSelection;