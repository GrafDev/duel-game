import { useEffect, useRef, useCallback } from 'react';
import { Position, Hero, Spell, GameState, VirtualField, Fireball } from '../types';
import { useGameContext } from "./useGameContext";
import { usePlayer } from "./usePlayer";

const FIREBALL_SPEED = 5;
const FIREBALL_SIZE = 10;

export const useCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { gameState, updateGameState, canvasSize } = useGameContext();
    const leftVirtualFieldRef = useRef<VirtualField>({ left: 0, right: 0, top: 0, bottom: 0 });
    const rightVirtualFieldRef = useRef<VirtualField>({ left: 0, right: 0, top: 0, bottom: 0 });
    const leftHeroDirectionRef = useRef<1 | -1>(1);
    const rightHeroDirectionRef = useRef<1 | -1>(1);
    const mousePositionRef = useRef<Position>({ x: 0, y: 0 });
    const fireballsRef = useRef<Fireball[]>([]);
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
        const minFieldHeight = hero.size.width * 2; // Минимальная высота поля - два диаметра круга
        const heroRadius = hero.size.width / 2;

        let newTop = virtualField.top;
        let newBottom = virtualField.bottom;

        // Проверяем, находится ли мышь на круге
        const mouseOnCircle = Math.abs(mouseY - hero.position.y) <= heroRadius;

        if (hero.position.y > mouseY) {
            // Круг игрока ниже курсора мыши
            if (mouseOnCircle) {
                newTop = hero.position.y - heroRadius; // Граница не заходит в круг
            } else {
                newTop = Math.min(mouseY, canvasSize.height - minFieldHeight);
            }
            newBottom = canvasSize.height;
        } else {
            // Круг игрока выше курсора мыши
            newTop = 0;
            if (mouseOnCircle) {
                newBottom = hero.position.y + heroRadius; // Граница не заходит в круг
            } else {
                newBottom = Math.max(mouseY, minFieldHeight);
            }
        }

        // Проверяем, чтобы расстояние между границами не было меньше минимального
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

    const handleMouseClick = useCallback((e: MouseEvent) => {
        if (e.button !== 0) return; // Проверяем, что это левая кнопка мыши

        const playerSide = gameState.playerSide;
        const hero = playerSide === 'left' ? gameState.leftHero : gameState.rightHero;

        const newFireball: Fireball = {
            position: { ...hero.position },
            direction: playerSide === 'left' ? 'right' : 'left',
            speed: FIREBALL_SPEED
        };

        fireballsRef.current.push(newFireball);
    }, [gameState.playerSide, gameState.leftHero, gameState.rightHero]);

    const updateFireballs = useCallback(() => {
        fireballsRef.current = fireballsRef.current.filter(fireball => {
            if (fireball.direction === 'right') {
                fireball.position.x += fireball.speed;
                return fireball.position.x < canvasSize.width;
            } else {
                fireball.position.x -= fireball.speed;
                return fireball.position.x > 0;
            }
        });
    }, [canvasSize.width]);

    const drawFireball = useCallback((ctx: CanvasRenderingContext2D, fireball: Fireball) => {
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(fireball.position.x, fireball.position.y, FIREBALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
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

        updateFireballs();
    }, [gameState, updateGameState, moveHero, adjustVirtualField, canvasSize.height, updateFireballs]);

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
            fireballsRef.current.forEach(fireball => drawFireball(ctx, fireball));
            drawMouseLine(ctx);
        };

        const gameLoop = () => {
            updateHeroPositions();
            draw();
            requestAnimationFrame(gameLoop);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleMouseClick);
        const animationId = requestAnimationFrame(gameLoop);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleMouseClick);
            cancelAnimationFrame(animationId);
        };
    }, [gameState, drawHero, drawSpell, drawFireball, drawMouseLine, handleMouseMove, handleMouseClick, updateHeroPositions]);

    return canvasRef;
};
