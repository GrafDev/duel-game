// src/hooks/useAI.ts
import { useEffect, useRef } from 'react';
import { useGameContext } from './useGameContext';
import { PlayerSide } from '../types';

export const useAI = (side: PlayerSide) => {
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const directionRef = useRef<1 | -1>(1);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const hero = gameState[side === 'left' ? 'leftHero' : 'rightHero'];
            let newY = hero.position.y + hero.speed * directionRef.current;

            if (newY - hero.size.height / 2 <= 0 || newY + hero.size.height / 2 >= canvasSize.height) {
                directionRef.current *= -1;
                newY = hero.position.y + hero.speed * directionRef.current;
            }

            updateGameState({
                [side === 'left' ? 'leftHero' : 'rightHero']: {
                    ...hero,
                    position: {
                        x: hero.position.x,
                        y: newY
                    }
                }
            });
        }, 1000 / 60); // 60 FPS

        return () => clearInterval(intervalId);
    }, [gameState, updateGameState, canvasSize, side]);
};
