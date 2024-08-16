// src/components/Controls.tsx

import React from 'react';
import styles from './Controls.module.css';
import { useGameContext } from '../../hooks/useGameContext.tsx';
import ControlSlider from "./ControlSlider.tsx";

const Controls: React.FC = () => {
    const { gameState, updateGameState } = useGameContext();

    const handleSpeedChange = (side: 'left' | 'right', value: number) => {
        updateGameState({
            [side === 'left' ? 'leftHero' : 'rightHero']: {
                ...gameState[side === 'left' ? 'leftHero' : 'rightHero'],
                speed: value
            }
        });
    };

    const handleFireRateChange = (side: 'left' | 'right', value: number) => {
        updateGameState({
            [side === 'left' ? 'leftHero' : 'rightHero']: {
                ...gameState[side === 'left' ? 'leftHero' : 'rightHero'],
                fireRate: value
            }
        });
    };

    return (
        <div className="controls">
            <div className={styles.sliders__left} >
                <ControlSlider
                    label="Скорость левого героя"
                    value={gameState.leftHero.speed}
                    onChange={(value) => handleSpeedChange('left', value)}
                    min={1}
                    max={10}
                />
                <ControlSlider
                    label="Частота стрельбы левого героя"
                    value={gameState.leftHero.fireRate}
                    onChange={(value) => handleFireRateChange('left', value)}
                    min={0.5}
                    max={5}
                    step={0.1}
                />
            </div>
            <div className={styles.sliders__right}>
                <ControlSlider
                    label="Скорость правого героя"
                    value={gameState.rightHero.speed}
                    onChange={(value) => handleSpeedChange('right', value)}
                    min={1}
                    max={10}
                />
                <ControlSlider
                    label="Частота стрельбы правого героя"
                    value={gameState.rightHero.fireRate}
                    onChange={(value) => handleFireRateChange('right', value)}
                    min={0.5}
                    max={5}
                    step={0.1}
                />
            </div>
        </div>
    );
};

export default Controls;