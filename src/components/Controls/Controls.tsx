import React, { useEffect, useCallback } from 'react';
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
    const playerSide: PlayerSide = gameState.playerSide;

    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -10 : 10;
        const currentSpeed = gameState[playerSide === 'left' ? 'leftHero' : 'rightHero'].speed;
        const newSpeed = Math.max(50, Math.min(200, currentSpeed + delta));
        onSpeedChange(playerSide, newSpeed);
    }, [gameState, onSpeedChange, playerSide]);

    useEffect(() => {
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    const renderHeroControls = (hero: Hero, side: PlayerSide) => {
        const isAI = side === aiSide;
        return (
            <div className={styles[`sliders_${side}`]}>
                <ControlSlider
                    label={`${isAI ? "Скорость бега железяки" : 'Скорость бега кожаного мешка'}`}
                    value={hero.speed}
                    onChange={(value) => !isAI && onSpeedChange(side, value)}
                    min={50}
                    max={200}
                    step={10}
                    disabled={isAI}
                />
                <ControlSlider
                    label={`${isAI ? 'Птыщ-птыщ в секунду из бластра' : 'Пиу-пиу в секунду из водяного пистолетика'}`}
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
        <div className={styles.controls}>
            {renderHeroControls(gameState.leftHero, 'left')}
            {renderHeroControls(gameState.rightHero, 'right')}
        </div>
    );
};

export default Controls;
