import React from 'react';
import styles from './Controls.module.css';
import ControlSlider from "./ControlSlider";
import {GameState, Hero, PlayerSide} from "../../types";

interface ControlsProps {
    gameState: GameState;
    onSpeedChange: (playerSide: PlayerSide, value: number) => void;
    onFireRateChange: (playerSide: PlayerSide, value: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ gameState, onSpeedChange, onFireRateChange }) => {
    const aiSide: PlayerSide = gameState.playerSide === 'left' ? 'right' : 'left';

    const renderHeroControls = (hero: Hero, side: PlayerSide) => {
        const isAI = side === aiSide;
        return (
            <div className={styles[`sliders_${side}`]}>
                <ControlSlider
                    label={`${isAI ? 'AI' : 'Player'} Hero Speed`}
                    value={hero.speed}
                    onChange={(value) => !isAI && onSpeedChange(side, value)}
                    min={1}
                    max={15}
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
