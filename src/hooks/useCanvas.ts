import { useEffect, useRef, useCallback } from 'react';
import { Position, Hero, Spell, GameState } from '../types';
import { useGameContext } from "./useGameContext";
import { usePlayer } from "./usePlayer";

interface VirtualField {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export const useCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const leftVirtualFieldRef = useRef<VirtualField>({ left: 0, right: 0, top: 0, bottom: 0 });
    const rightVirtualFieldRef = useRef<VirtualField>({ left: 0, right: 0, top: 0, bottom: 0 });
    const leftHeroDirectionRef = useRef<1 | -1>(1);
    const rightHeroDirectionRef = useRef<1 | -1>(1);
    const mousePositionRef = useRef<Position>({ x: 0, y: 0 });
    const { drawMouseLine } = usePlayer(gameState.playerSide);

    const initializeVirtualFields = useCallback(() => {
        const leftHeroRadius = gameState.leftHero.size.width / 2;
        const rightHeroRadius = gameState.rightHero.size.width / 2;

        leftVirtualFieldRef.current = {
            left: gameState.leftHero.position.x - leftHeroRadius,
            right: gameState.leftHero.position.x + leftHeroRadius,
            top: 0,
            bottom: canvasSize.height
        };

        rightVirtualFieldRef.current = {
            left: gameState.rightHero.position.x - rightHeroRadius,
            right: gameState.rightHero.position.x + rightHeroRadius,
            top: 0,
            bottom: canvasSize.height
        };
    }, [gameState.leftHero, gameState.rightHero, canvasSize.height]);

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
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        mousePositionRef.current = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }, []);

    const adjustVirtualField = useCallback((hero: Hero, virtualField: VirtualField, mouseY: number) => {
        if (hero.position.y > mouseY) {
            // Круг игрока ниже курсора мыши
            virtualField.top = mouseY;
            virtualField.bottom = canvasSize.height;
        } else {
            // Круг игрока выше курсора мыши
            virtualField.bottom = mouseY;
            virtualField.top = 0;
        }
        return virtualField;
    }, [canvasSize.height]);

    const moveHero = useCallback((hero: Hero, directionRef: React.MutableRefObject<1 | -1>, virtualField: VirtualField) => {
        let newY = hero.position.y + hero.speed * directionRef.current;

        if (newY - hero.size.height / 2 <= virtualField.top || newY + hero.size.height / 2 >= virtualField.bottom) {
            directionRef.current *= -1;
            newY = hero.position.y + hero.speed * directionRef.current;
        }

        return { ...hero, position: { ...hero.position, y: newY } };
    }, []);

    const updateHeroPositions = useCallback(() => {
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;

        // Проверяем, находится ли мышь в поле левого игрока
        if (mouseX >= leftVirtualFieldRef.current.left && mouseX <= leftVirtualFieldRef.current.right) {
            leftVirtualFieldRef.current = adjustVirtualField(gameState.leftHero, leftVirtualFieldRef.current, mouseY);
        } else {
            // Мгновенное возвращение поля к исходным размерам
            leftVirtualFieldRef.current.top = 0;
            leftVirtualFieldRef.current.bottom = canvasSize.height;
        }

        // Проверяем, находится ли мышь в поле правого игрока
        if (mouseX >= rightVirtualFieldRef.current.left && mouseX <= rightVirtualFieldRef.current.right) {
            rightVirtualFieldRef.current = adjustVirtualField(gameState.rightHero, rightVirtualFieldRef.current, mouseY);
        } else {
            // Мгновенное возвращение поля к исходным размерам
            rightVirtualFieldRef.current.top = 0;
            rightVirtualFieldRef.current.bottom = canvasSize.height;
        }

        const leftHero = moveHero(gameState.leftHero, leftHeroDirectionRef, leftVirtualFieldRef.current);
        const rightHero = moveHero(gameState.rightHero, rightHeroDirectionRef, rightVirtualFieldRef.current);

        updateGameState((prevState: GameState) => ({
            ...prevState,
            leftHero,
            rightHero
        }));
    }, [gameState, updateGameState, moveHero, adjustVirtualField, canvasSize.height]);

    useEffect(() => {
        initializeVirtualFields();
    }, [initializeVirtualFields]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Отрисовка виртуальных полей (для отладки)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.strokeRect(
                leftVirtualFieldRef.current.left,
                leftVirtualFieldRef.current.top,
                leftVirtualFieldRef.current.right - leftVirtualFieldRef.current.left,
                leftVirtualFieldRef.current.bottom - leftVirtualFieldRef.current.top
            );
            ctx.strokeRect(
                rightVirtualFieldRef.current.left,
                rightVirtualFieldRef.current.top,
                rightVirtualFieldRef.current.right - rightVirtualFieldRef.current.left,
                rightVirtualFieldRef.current.bottom - rightVirtualFieldRef.current.top
            );

            drawHero(ctx, gameState.leftHero);
            drawHero(ctx, gameState.rightHero);
            gameState.spells.forEach(spell => drawSpell(ctx, spell));
            drawMouseLine(ctx);
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
    }, [gameState, drawHero, drawSpell, drawMouseLine, handleMouseMove, updateHeroPositions]);

    return canvasRef;
};