import React, { useEffect, useRef, useCallback } from 'react';
import { useGameContext } from './useGameContext';
import { useMouseInteraction } from './useMouseInteraction';
import { Position, Hero } from '../types';

// Определение VirtualField внутри файла
interface VirtualField {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export const useCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const { drawMouseLine, getMousePosition } = useMouseInteraction();
    const leftVirtualFieldRef = useRef<VirtualField>({ left: 0, right: 0, top: 0, bottom: 0 });
    const rightVirtualFieldRef = useRef<VirtualField>({ left: 0, right: 0, top: 0, bottom: 0 });
    const leftHeroDirectionRef = useRef<1 | -1>(1);
    const rightHeroDirectionRef = useRef<1 | -1>(1);

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

    const adjustVirtualField = useCallback((hero: Hero, virtualField: VirtualField, mouseY: number) => {
        const minFieldHeight = hero.size.width * 2;
        const heroRadius = hero.size.width / 2;

        let newTop = virtualField.top;
        let newBottom = virtualField.bottom;

        const mouseOnCircle = Math.abs(mouseY - hero.position.y) <= heroRadius;

        if (hero.position.y > mouseY) {
            if (mouseOnCircle) {
                newTop = hero.position.y - heroRadius;
            } else {
                newTop = Math.min(mouseY, canvasSize.height - minFieldHeight);
            }
            newBottom = canvasSize.height;
        } else {
            newTop = 0;
            if (mouseOnCircle) {
                newBottom = hero.position.y + heroRadius;
            } else {
                newBottom = Math.max(mouseY, minFieldHeight);
            }
        }

        if (newBottom - newTop < minFieldHeight) {
            if (hero.position.y > mouseY) {
                newTop = newBottom - minFieldHeight;
            } else {
                newBottom = newTop + minFieldHeight;
            }
        }

        virtualField.top = newTop;
        virtualField.bottom = newBottom;

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

    const updateHeroPositions = useCallback((mousePosition: Position | null) => {
        if (mousePosition) {
            const mouseX = mousePosition.x;
            const mouseY = mousePosition.y;

            if (mouseX >= leftVirtualFieldRef.current.left && mouseX <= leftVirtualFieldRef.current.right) {
                leftVirtualFieldRef.current = adjustVirtualField(gameState.leftHero, leftVirtualFieldRef.current, mouseY);
            } else {
                leftVirtualFieldRef.current.top = 0;
                leftVirtualFieldRef.current.bottom = canvasSize.height;
            }

            if (mouseX >= rightVirtualFieldRef.current.left && mouseX <= rightVirtualFieldRef.current.right) {
                rightVirtualFieldRef.current = adjustVirtualField(gameState.rightHero, rightVirtualFieldRef.current, mouseY);
            } else {
                rightVirtualFieldRef.current.top = 0;
                rightVirtualFieldRef.current.bottom = canvasSize.height;
            }
        }

        const leftHero = moveHero(gameState.leftHero, leftHeroDirectionRef, leftVirtualFieldRef.current);
        const rightHero = moveHero(gameState.rightHero, rightHeroDirectionRef, rightVirtualFieldRef.current);

        updateGameState(prevState => ({
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
            drawMouseLine(ctx);
        };

        const gameLoop = () => {
            const mousePosition = getMousePosition();
            updateHeroPositions(mousePosition);
            draw();
            requestAnimationFrame(gameLoop);
        };

        const animationId = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [gameState, drawHero, drawMouseLine, getMousePosition, updateHeroPositions]);

    return canvasRef;
};
