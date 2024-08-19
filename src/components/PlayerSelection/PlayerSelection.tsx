import React from 'react';
import { PlayerSide } from '../../types';
import styles from './PlayerSelection.module.css';

interface PlayerSelectionProps {
    onSelectSide: (playerSide: PlayerSide) => void;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({ onSelectSide }) => {
    return (
        <div className={styles.container}>
            <div className={styles.name} >
                WB-Duel
            </div>

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
                <div className={styles.line}>
                    Вы будете играть за одного из героев.
                    За другого героя будет играть компьютер.
                    Вы можете управлять героем, устанавливая перед ним преграду мышью.
                    Вы так же сможете управлять скоростью своего героя и частотой атаки.
                    Дополнительно вы можете менять скорость движения героя колесом мышки.
                </div>
            </div>
        </div>
    );
};

export default PlayerSelection;
