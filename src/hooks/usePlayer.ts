// src/hooks/usePlayer.ts
import { useEffect } from 'react';
import { useGameContext } from './useGameContext';
import { PlayerSide, Position } from '../types';

export const usePlayer = (side: PlayerSide) => {
    const { gameState, updateGameState, canvasSize } = useGameContext();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const mousePosition: Position = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            const hero = gameState[side === 'left' ? 'leftHero' : 'rightHero'];
            const newY = Math.max(
                hero.size.height / 2,
                Math.min(mousePosition.y, canvasSize.height - hero.size.height / 2)
            );

            updateGameState({
                [side === 'left' ? 'leftHero' : 'rightHero']: {
                    ...hero,
                    position: {
                        x: hero.position.x,
                        y: newY
                    }
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [gameState, updateGameState, canvasSize, side]);
};