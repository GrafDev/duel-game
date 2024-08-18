import { useEffect, useRef } from 'react';
import { useGameContext } from './useGameContext';
import { PlayerSide } from '../types';

export const useAI = (aiSide: PlayerSide) => {
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const directionRef = useRef<1 | -1>(1);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const hero = gameState[aiSide === 'left' ? 'leftHero' : 'rightHero'];
            let newY = hero.position.y + hero.speed * directionRef.current;

            if (newY - hero.size.height / 2 <= 0 || newY + hero.size.height / 2 >= canvasSize.height) {
                directionRef.current *= -1;
                newY = hero.position.y + hero.speed * directionRef.current;
            }

            updateGameState(prevState => ({
                ...prevState,
                [aiSide === 'left' ? 'leftHero' : 'rightHero']: {
                    ...hero,
                    position: {
                        x: hero.position.x,
                        y: newY
                    }
                }
            }));
        }, 1); // 60 FPS

        return () => clearInterval(intervalId);
    }, [gameState, updateGameState, canvasSize, aiSide]);
};
