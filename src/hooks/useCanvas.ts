import { useCallback } from 'react';
import { GameState, GameSettings, Hero, Spell } from '../types';

export const useCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, gameSettings: GameSettings) => {
    const drawHero = useCallback((ctx: CanvasRenderingContext2D, hero: Hero) => {
        ctx.fillStyle = hero.color;
        ctx.fillRect(hero.position.x, hero.position.y, hero.size.width, hero.size.height);
    }, []);

    const drawSpell = useCallback((ctx: CanvasRenderingContext2D, spell: Spell) => {
        ctx.fillStyle = spell.color;
        ctx.beginPath();
        ctx.arc(
            spell.position.x + spell.size.width / 2,
            spell.position.y + spell.size.height / 2,
            spell.size.width / 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }, []);

    const drawScore = useCallback((ctx: CanvasRenderingContext2D, score: { player: number; ai: number }) => {
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Player: ${score.player}`, 10, 30);
        ctx.textAlign = 'right';
        ctx.fillText(`AI: ${score.ai}`, gameSettings.canvasSize.width - 10, 30);
    }, [gameSettings.canvasSize.width]);

    const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, gameSettings.canvasSize.width, gameSettings.canvasSize.height);

        // Draw a middle line
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(gameSettings.canvasSize.width / 2, 0);
        ctx.lineTo(gameSettings.canvasSize.width / 2, gameSettings.canvasSize.height);
        ctx.stroke();
    }, [gameSettings.canvasSize]);

    const drawGame = useCallback((gameState: GameState) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, gameSettings.canvasSize.width, gameSettings.canvasSize.height);

        // Draw background
        drawBackground(ctx);

        // Draw heroes
        drawHero(ctx, gameState.player);
        drawHero(ctx, gameState.ai);

        // Draw spells
        gameState.spells.forEach(spell => drawSpell(ctx, spell));

        // Draw score
        drawScore(ctx, gameState.score);
    }, [gameSettings.canvasSize, drawBackground, drawHero, drawSpell, drawScore]);

    return { drawGame };
};