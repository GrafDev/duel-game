import React, { useEffect } from 'react';
import styles from './Controls.module.css';
import ControlSlider from "./ControlSlider";
import { GameState, Hero, PlayerSide } from "../../types";

interface ControlsProps {
    gameState: GameState;
    onSpeedChange: (playerSide: PlayerSide, value: number) => void;
    onFireRateChange: (playerSide: PlayerSide, value: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ gameState, onSpeedChange, onFireRateChange }) => {
    const aiSide: PlayerSide = gameState.playerSide === 'left' ? 'right' : 'left';

    useEffect(() => {
        const aiControlInterval = setInterval(() => {
            if (Math.random() < 1/30) {
                const randomSpeed = (Math.random() * 4 + 1) * 3; // Random speed between 3 and 15
                const randomFireRate = Math.random() * 4.5 + 0.5; // Random fire rate between 0.5 and 5
                onSpeedChange(aiSide, randomSpeed / 3); // Divide by 3 because handleSpeedChange multiplies by 3
                onFireRateChange(aiSide, randomFireRate);
            }
        }, 1000);

        return () => clearInterval(aiControlInterval);
    }, [aiSide, onSpeedChange, onFireRateChange]);

    const renderHeroControls = (hero: Hero, side: PlayerSide) => {
        const isAI = side === aiSide;
        return (
            <div className={styles[`sliders_${side}`]}>
                <ControlSlider
                    label={`${isAI ? 'AI' : 'Player'} Hero Speed`}
                    value={hero.speed / 3} // Divide by 3 to show correct value on slider
                    onChange={(value) => !isAI && onSpeedChange(side, value)}
                    min={1}
                    max={5}
                    step={0.1}
                    disabled={isAI}
                />
                <ControlSlider
                    label={`${isAI ? 'AI' : 'Player'} Hero Fire Rate`}
                    value={hero.fireRate}
                    onChange={(value) => !isAI && onFireRateChange(side, value)}
                    min={0.5}
                    max={5}
                    step={0.1}
                    disabled={isAI}
                />
            </div>
        );
    };

    return (
        <div className={styles.sliders}>
            {renderHeroControls(gameState.leftHero, 'left')}
            {renderHeroControls(gameState.rightHero, 'right')}
        </div>
    );
};

export default Controls;
