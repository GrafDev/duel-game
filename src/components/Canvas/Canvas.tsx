// src/components/Canvas.tsx
import React, {useRef, useEffect} from 'react';
import {useGameContext} from '../../hooks/useGameContext.tsx';
import {Hero, Spell, Position} from '../../types';


const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {gameState, canvasSize, updateGameState} = useGameContext();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {

            // Очистка канваса
            ctx.fillStyle = '#064406';
            ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

            // Отрисовка героев
            drawHero(ctx, gameState.leftHero);
            drawHero(ctx, gameState.rightHero);

            // Отрисовка заклинаний
            gameState.spells.forEach(spell => drawSpell(ctx, spell));

            // Запрос следующего кадра
            requestAnimationFrame(draw);
        };

        draw();
    }, [gameState, canvasSize]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const mousePosition: Position = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            // Обновление положения героя в зависимости от стороны игрока
            updateGameState({
                [gameState.playerSide === 'left' ? 'leftHero' : 'rightHero']: {
                    ...gameState[gameState.playerSide === 'left' ? 'leftHero' : 'rightHero'],
                    position: {
                        x: gameState.playerSide === 'left' ? gameState.leftHero.position.x : gameState.rightHero.position.x,
                        y: mousePosition.y
                    }
                }
            });
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [gameState.playerSide, updateGameState]);

    return <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}/>
};

const drawHero = (ctx: CanvasRenderingContext2D, hero: Hero) => {
    ctx.fillStyle = hero.color;
    ctx.beginPath();
    ctx.arc(hero.position.x, hero.position.y, hero.size.width / 2, 0, Math.PI * 2);
    ctx.fill();
};

const drawSpell = (ctx: CanvasRenderingContext2D, spell: Spell) => {
    ctx.fillStyle = spell.color;
    ctx.beginPath();
    ctx.arc(spell.position.x, spell.position.y, spell.size.width / 2, 0, Math.PI * 2);
    ctx.fill();
};

export default Canvas;