import { useEffect, useRef, useCallback } from 'react';
import { useGameContext } from './useGameContext';
import { useMouseInteraction } from './useMouseInteraction';
import { PlayerSide, Hero } from '../types';

const BOUNCE_COOLDOWN = 1200;
const MOUSE_LINE_HEIGHT = 20;
const MOUSE_LINE_WIDTH = 40;

export const usePlayer = (playerSide: PlayerSide) => {
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const { getMousePosition } = useMouseInteraction();
    const directionRef = useRef<1 | -1>(1);
    const lastBounceTimeRef = useRef<number>(0);

    const moveHero = useCallback((hero: Hero, deltaTime: number) => {
        const mousePosition = getMousePosition();
        const heroRadius = hero.size.width / 2;
        const movement = hero.speed * directionRef.current * (deltaTime / 1000);
        let newY = hero.position.y + movement;

        if (mousePosition &&
            Math.abs(hero.position.x - mousePosition.x) < MOUSE_LINE_WIDTH / 2) {
            const currentTime = Date.now();
            if (currentTime - lastBounceTimeRef.current > BOUNCE_COOLDOWN) {
                if (Math.abs(newY - heroRadius - mousePosition.y) < MOUSE_LINE_HEIGHT / 2 && directionRef.current === 1) {
                    directionRef.current = -1;
                    lastBounceTimeRef.current = currentTime;
                }
                else if (Math.abs(newY + heroRadius - mousePosition.y) < MOUSE_LINE_HEIGHT / 2 && directionRef.current === -1) {
                    directionRef.current = 1;
                    lastBounceTimeRef.current = currentTime;
                }
            }
        }

        // Ограничение движения в пределах канваса
        if (newY <= heroRadius || newY >= canvasSize.height - heroRadius) {
            directionRef.current *= -1;
            newY = Math.max(heroRadius, Math.min(newY, canvasSize.height - heroRadius));
        }

        return {
            ...hero,
            position: {
                x: hero.position.x,
                y: newY
            }
        };
    }, [getMousePosition, canvasSize.height]);

    useEffect(() => {
        let animationFrameId: number;
        let lastTime = 0;

        const gameLoop = (time: number) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            const hero = gameState[playerSide === 'left' ? 'leftHero' : 'rightHero'];
            const updatedHero = moveHero(hero, deltaTime);

            updateGameState(prevState => ({
                ...prevState,
                [playerSide === 'left' ? 'leftHero' : 'rightHero']: updatedHero
            }));

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        animationFrameId = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, updateGameState, playerSide, moveHero]);

    return {};
};
