import { useEffect, useRef } from 'react';
import { useGameContext } from './useGameContext';
import { PlayerSide, Position, Hero } from '../types';

const MOUSE_LINE_HEIGHT = 20;
const MOUSE_LINE_WIDTH = 40;
const BOUNCE_COOLDOWN = 1200;

export const usePlayer = (side: PlayerSide) => {
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const directionRef = useRef<1 | -1>(1);
    const lastBounceTimeRef = useRef<number>(0);
    const mousePositionRef = useRef<Position | null>(null);

    const moveHero = (hero: Hero, mousePosition: Position | null, deltaTime: number) => {
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
    };

    const drawMouseLine = (ctx: CanvasRenderingContext2D) => {
        if (mousePositionRef.current) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mousePositionRef.current.x - MOUSE_LINE_WIDTH / 2, mousePositionRef.current.y);
            ctx.lineTo(mousePositionRef.current.x + MOUSE_LINE_WIDTH / 2, mousePositionRef.current.y);
            ctx.stroke();
            ctx.restore();
        }
    };

    useEffect(() => {
        let animationFrameId: number;
        let lastTime = 0;

        const gameLoop = (time: number) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            const hero = gameState[side === 'left' ? 'leftHero' : 'rightHero'];
            const updatedHero = moveHero(hero, mousePositionRef.current, deltaTime);

            updateGameState({
                [side === 'left' ? 'leftHero' : 'rightHero']: updatedHero
            });

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        animationFrameId = requestAnimationFrame(gameLoop);

        const handleMouseMove = (e: MouseEvent) => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            mousePositionRef.current = {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, updateGameState, canvasSize, side]);

    return { drawMouseLine };
};
