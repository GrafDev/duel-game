// src/components/Controls/Controls.tsx

import React, { useCallback } from 'react';
import styles from './Controls.module.css';
import ControlSlider from "./ControlSlider";
import { PlayerSide } from '../../types';
import {useGameContext} from "../../hooks/useGameContext.tsx";

const Controls: React.FC = () => {
    const { gameState, updateGameState } = useGameContext();

    const handleSpeedChange = useCallback((playerSide: PlayerSide, value: number) => {
        updateGameState(prevState => ({
            ...prevState,
            [playerSide === 'left' ? 'leftHero' : 'rightHero']: {
                ...prevState[playerSide === 'left' ? 'leftHero' : 'rightHero'],
                speed: value
            }
        }));
    }, [updateGameState]);

    const handleFireRateChange = useCallback((playerSide: PlayerSide, value: number) => {
        updateGameState(prevState => ({
            ...prevState,
            [playerSide === 'left' ? 'leftHero' : 'rightHero']: {
                ...prevState[playerSide === 'left' ? 'leftHero' : 'rightHero'],
                fireRate: value
            }
        }));
    }, [updateGameState]);

    return (
        <div className={styles.sliders}>
            <div className={styles.sliders_left}>
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
            <div className={styles.sliders_right}>
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
