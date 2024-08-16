// src/hooks/useCanvas.ts
import { useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { Position, Hero, Spell, GameState} from '../types';

export const useCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const leftHeroDirectionRef = useRef<1 | -1>(1);
    const rightHeroDirectionRef = useRef<1 | -1>(1);
    const mousePositionRef = useRef<Position>({ x: 0, y: 0 });

    const drawHero = useCallback((ctx: CanvasRenderingContext2D, hero: Hero) => {
        ctx.fillStyle = hero.color;
        ctx.beginPath();
        ctx.arc(hero.position.x, hero.position.y, hero.size.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }, []);

    const drawSpell = useCallback((ctx: CanvasRenderingContext2D, spell: Spell) => {
        ctx.fillStyle = spell.color;
        ctx.beginPath();
        ctx.arc(spell.position.x, spell.position.y, spell.size.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        mousePositionRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }, []);

    const moveHero = useCallback((hero: Hero, directionRef: React.MutableRefObject<1 | -1>, isPlayerHero: boolean) => {
        let newY = hero.position.y + hero.speed * directionRef.current;

        if (isPlayerHero) {
            const mouseY = mousePositionRef.current.y;
            const heroCenterY = hero.position.y;
            const heroRadius = hero.size.width / 2;

            if (Math.abs(mouseY - heroCenterY) <= heroRadius) {
                directionRef.current *= -1;
                newY = heroCenterY + heroRadius * directionRef.current;
            }
        }

        if (newY - hero.size.height / 2 <= 0 || newY + hero.size.height / 2 >= canvasSize.height) {
            directionRef.current *= -1;
            newY = hero.position.y + hero.speed * directionRef.current;
        }

        return { ...hero, position: { ...hero.position, y: newY } };
    }, [canvasSize.height]);

    const updateHeroPositions = useCallback(() => {
        const playerSide = gameState.playerSide;
        const leftHero = moveHero(gameState.leftHero, leftHeroDirectionRef, playerSide === 'left');
        const rightHero = moveHero(gameState.rightHero, rightHeroDirectionRef, playerSide === 'right');

        updateGameState((prevState: GameState) => ({
            ...prevState,
            leftHero,
            rightHero
        }));
    }, [gameState, updateGameState, moveHero]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawHero(ctx, gameState.leftHero);
            drawHero(ctx, gameState.rightHero);

            gameState.spells.forEach(spell => drawSpell(ctx, spell));
        };

        const gameLoop = () => {
            updateHeroPositions();
            draw();
            requestAnimationFrame(gameLoop);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        const animationId = requestAnimationFrame(gameLoop);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, [gameState, drawHero, drawSpell, handleMouseMove, updateHeroPositions]);

    return canvasRef;
};