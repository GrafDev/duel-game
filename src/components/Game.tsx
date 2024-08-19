import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Hero, Spell, PlayerSide, Position } from '../types';
import ScoreBoard from "./ScoreBoard/ScoreBoard";
import PlayerSelection from "./PlayerSelection/PlayerSelection";
import Controls from "./Controls/Controls";
import styles from './Game.module.css';
import { useMouseInteraction } from "../hooks/useMouseInteraction";

const DEFAULT_GAME_STATE: GameState = {
    leftHero: {
        position: { x: 40, y: 100 },
        size: { width: 40, height: 40 },
        color: 'yellow',
        spellColor: 'gold',
        speed: 7.5,  // Увеличено с 2.5 до 7.5
        fireRate: 3,
        direction: -1,
        aiDirectionChangeInterval: 0,
        aiSpeedChangeInterval: 0
    },
    rightHero: {
        position: { x: 720, y: 500 },
        size: { width: 40, height: 40 },
        color: 'green',
        spellColor: 'lightgreen',
        speed: 7.5,  // Увеличено с 2.5 до 7.5
        fireRate: 3,
        direction: 1,
        aiDirectionChangeInterval: 0,
        aiSpeedChangeInterval: 0
    },
    spells: [],
    score: { left: 0, right: 0 },
    playerSide: 'left' as PlayerSide
};

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
    const { drawMouseLine, getMousePosition } = useMouseInteraction();

    const updateCanvasSize = useCallback(() => {
        const width = Math.floor(window.innerWidth * 0.8);
        const height = Math.floor(window.innerHeight * 0.7);
        setCanvasSize({ width, height });

        setGameState(prevState => ({
            ...prevState,
            leftHero: {
                ...prevState.leftHero,
                position: { x: prevState.leftHero.size.width, y: height / 2 }
            },
            rightHero: {
                ...prevState.rightHero,
                position: { x: width - prevState.rightHero.size.width * 2, y: height / 2 }
            }
        }));
    }, []);

    useEffect(() => {
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [updateCanvasSize]);

    useEffect(() => {
        if (!gameStarted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const gameLoop = setInterval(() => {
            updateGame();
            drawGame(context);
        }, 1000 / 60); // 60 FPS

        return () => clearInterval(gameLoop);
    }, [canvasSize, gameStarted]);

    const updateGame = () => {
        setGameState(prevState => {
            const newState = { ...prevState };

            const mousePosition = getMousePosition();

            newState.leftHero = updateHeroPosition(newState.leftHero, 'left', mousePosition, newState.playerSide);
            newState.rightHero = updateHeroPosition(newState.rightHero, 'right', mousePosition, newState.playerSide);

            // Update AI hero
            const aiSide = newState.playerSide === 'left' ? 'right' : 'left';
            const aiHero = aiSide === 'left' ? newState.leftHero : newState.rightHero;

            // Update AI direction
            if (aiHero.aiDirectionChangeInterval <= 0) {
                aiHero.direction = Math.random() < 0.5 ? 1 : -1;
                aiHero.aiDirectionChangeInterval = Math.floor(Math.random() * 120) + 60; // Change direction every 1-3 seconds
            } else {
                aiHero.aiDirectionChangeInterval--;
            }

            // Update AI speed
            if (aiHero.aiSpeedChangeInterval <= 0) {
                aiHero.speed = Math.random() * 4 + 1; // Random speed between 1 and 5
                aiHero.aiSpeedChangeInterval = Math.floor(Math.random() * 300) + 60; // Change speed every 1-6 seconds
            } else {
                aiHero.aiSpeedChangeInterval--;
            }

            // Update spells
            newState.spells = updateSpells(newState);

            return newState;
        });
    };

    const updateHeroPosition = (hero: Hero, side: 'left' | 'right', mousePosition: Position | null, playerSide: PlayerSide): Hero => {
        const newHero = { ...hero };
        let newY = hero.position.y + hero.speed * hero.direction * 0.3; // Увеличено с 0.1 до 0.3

        const isPlayerControlled = (side === playerSide);

        if (isPlayerControlled && mousePosition) {
            const heroCenter = {
                x: hero.position.x + hero.size.width / 2,
                y: newY + hero.size.height / 2
            };
            const distanceToMouse = Math.sqrt(
                Math.pow(heroCenter.x - mousePosition.x, 2) +
                Math.pow(heroCenter.y - mousePosition.y, 2)
            );

            if (distanceToMouse <= hero.size.width / 2) {
                const vectorX = heroCenter.x - mousePosition.x;
                const vectorY = heroCenter.y - mousePosition.y;

                const length = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
                const normalizedX = vectorX / length;
                const normalizedY = vectorY / length;

                newY = mousePosition.y + normalizedY * hero.size.height / 2 - hero.size.height / 2;

                newHero.direction = normalizedY > 0 ? 1 : -1;
            }
        }

        if (newY <= 0) {
            newY = 0;
            newHero.direction = 1;
        } else if (newY + hero.size.height >= canvasSize.height) {
            newY = canvasSize.height - hero.size.height;
            newHero.direction = -1;
        }

        newHero.position.y = newY;
        newHero.position.x = side === 'left' ? hero.size.width : canvasSize.width - hero.size.width * 2;

        return newHero;
    };

    const updateSpells = (state: GameState): Spell[] => {
        const updatedSpells = state.spells.filter(spell => {
            const newPosition = updateSpellPosition(spell);
            if (checkSpellCollision(newPosition, state.leftHero)) {
                state.score.right++;
                return false;
            }
            if (checkSpellCollision(newPosition, state.rightHero)) {
                state.score.left++;
                return false;
            }
            spell.position = newPosition;
            return true;
        });

        // Add new spells
        ['left', 'right'].forEach(side => {
            const hero = side === 'left' ? state.leftHero : state.rightHero;
            if (Math.random() < hero.fireRate / 100) {
                updatedSpells.push({
                    position: {
                        x: hero.position.x + hero.size.width / 2,
                        y: hero.position.y + hero.size.height / 2
                    },
                    size: { width: 10, height: 10 },
                    color: hero.spellColor,
                    direction: side === 'left' ? 'right' : 'left'
                });
            }
        });

        return updatedSpells;
    };

    const updateSpellPosition = (spell: Spell): Position => {
        const speed = 6; // Увеличено с 2 до 6
        return {
            x: spell.position.x + (spell.direction === 'right' ? speed : -speed),
            y: spell.position.y
        };
    };

    const checkSpellCollision = (spellPosition: Position, hero: Hero): boolean => {
        return (
            spellPosition.x < hero.position.x + hero.size.width &&
            spellPosition.x + 10 > hero.position.x &&
            spellPosition.y < hero.position.y + hero.size.height &&
            spellPosition.y + 10 > hero.position.y
        );
    };

    const drawGame = (context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, canvasSize.width, canvasSize.height);

        context.fillStyle = '#f0f0f0';
        context.fillRect(0, 0, canvasSize.width, canvasSize.height);

        drawHero(context, gameState.leftHero);
        drawHero(context, gameState.rightHero);

        gameState.spells.forEach(spell => drawSpell(context, spell));

        drawMouseLine(context);
    };

    const drawHero = (context: CanvasRenderingContext2D, hero: Hero) => {
        context.fillStyle = hero.color;
        context.beginPath();
        context.arc(
            hero.position.x + hero.size.width / 2,
            hero.position.y + hero.size.height / 2,
            hero.size.width / 2,
            0,
            2 * Math.PI
        );
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.stroke();
    };

    const drawSpell = (context: CanvasRenderingContext2D, spell: Spell) => {
        context.fillStyle = spell.color;
        context.beginPath();
        context.arc(
            spell.position.x + 5,
            spell.position.y + 5,
            5,
            0,
            2 * Math.PI
        );
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.stroke();
    };

    const handleExit = () => {
        setGameState(DEFAULT_GAME_STATE);
        setGameStarted(false);
    };

    const handleSelectSide = (playerSide: PlayerSide) => {
        setGameState(prevState => ({
            ...prevState,
            playerSide: playerSide,
            leftHero: {
                ...prevState.leftHero,
                position: { x: prevState.leftHero.size.width, y: canvasSize.height / 2 }
            },
            rightHero: {
                ...prevState.rightHero,
                position: { x: canvasSize.width - prevState.rightHero.size.width * 2, y: canvasSize.height / 2 }
            }
        }));
        setGameStarted(true);
    };

    const handleSpeedChange = useCallback((playerSide: PlayerSide, value: number) => {
        setGameState(prevState => ({
            ...prevState,
            [playerSide === 'left' ? 'leftHero' : 'rightHero']: {
                ...prevState[playerSide === 'left' ? 'leftHero' : 'rightHero'],
                speed: value * 3 // Увеличиваем скорость в 3 раза
            }
        }));
    }, []);

    const handleFireRateChange = useCallback((playerSide: PlayerSide, value: number) => {
        setGameState(prevState => ({
            ...prevState,
            [playerSide === 'left' ? 'leftHero' : 'rightHero']: {
                ...prevState[playerSide === 'left' ? 'leftHero' : 'rightHero'],
                fireRate: value
            }
        }));
    }, []);

    if (!gameStarted) {
        return <PlayerSelection onSelectSide={handleSelectSide} />;
    }

    return (
        <div className={styles.game}>
            <ScoreBoard gameState={gameState} handleExit={handleExit} />
            <div className={styles.field}>
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{border: '2px solid black', marginTop: '20px'}}
                />
            </div>
            <Controls
                gameState={gameState}
                onSpeedChange={handleSpeedChange}
                onFireRateChange={handleFireRateChange}
            />
        </div>
    );
};

export default Game;
