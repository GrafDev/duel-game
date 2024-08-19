import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Hero, Spell, PlayerSide, Position } from '../types';
import ScoreBoard from "./ScoreBoard/ScoreBoard";
import PlayerSelection from "./PlayerSelection/PlayerSelection";
import Controls from "./Controls/Controls";
import styles from './Game.module.css';
import { useMouseInteraction } from "../hooks/useMouseInteraction";

// Константы для балансировки игры
const GAME_CONSTANTS = {
    FPS: 60,
    HERO_SIZE: 40,
    SPELL_SIZE: 10,
    HERO_SPEED: 7.5,
    SPELL_SPEED:1,
    DEFAULT_FIRE_RATE: 3,
    HERO_MIN_SPEED: 1,
    HERO_MAX_SPEED: 15,
    FIRE_RATE_MIN: 0.5,
    FIRE_RATE_MAX: 5,
};

const DEFAULT_GAME_STATE: GameState = {
    leftHero: {
        position: { x: GAME_CONSTANTS.HERO_SIZE, y: 100 },
        size: { width: GAME_CONSTANTS.HERO_SIZE, height: GAME_CONSTANTS.HERO_SIZE },
        color: 'yellow',
        spellColor: 'gold',
        speed: GAME_CONSTANTS.HERO_SPEED,
        fireRate: GAME_CONSTANTS.DEFAULT_FIRE_RATE,
        direction: -1,
        aiDirectionChangeInterval: 0,
        aiSpeedChangeInterval: 0,
        lastShotTime: 0
    },
    rightHero: {
        position: { x: 720, y: 500 },
        size: { width: GAME_CONSTANTS.HERO_SIZE, height: GAME_CONSTANTS.HERO_SIZE },
        color: 'green',
        spellColor: 'lightgreen',
        speed: GAME_CONSTANTS.HERO_SPEED,
        fireRate: GAME_CONSTANTS.DEFAULT_FIRE_RATE,
        direction: 1,
        aiDirectionChangeInterval: 0,
        aiSpeedChangeInterval: 0,
        lastShotTime: 0
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
    const [debugMessage, setDebugMessage] = useState<string>('');

    const FPS = 60;

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
        }, 1000 / FPS);

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
                aiHero.aiDirectionChangeInterval = Math.floor(Math.random() * 120) + 60;
            } else {
                aiHero.aiDirectionChangeInterval--;
            }

            // Update AI speed
            if (aiHero.aiSpeedChangeInterval <= 0) {
                aiHero.speed = Math.random() * 4 + 1;
                aiHero.aiSpeedChangeInterval = Math.floor(Math.random() * 300) + 60;
            } else {
                aiHero.aiSpeedChangeInterval--;
            }

            // Update spells
            const { updatedSpells, leftHit, rightHit } = updateSpells(newState);
            newState.spells = updatedSpells;

            if (leftHit) {
                newState.score.right++;
                const message = `Hit! Right hero scored. New score: Left ${newState.score.left} - Right ${newState.score.right}`;
                setDebugMessage(message);
                console.log(message);
            }

            if (rightHit) {
                newState.score.left++;
                const message = `Hit! Left hero scored. New score: Left ${newState.score.left} - Right ${newState.score.right}`;
                setDebugMessage(message);
                console.log(message);
            }

            return newState;
        });
    };

    const updateHeroPosition = (hero: Hero, side: 'left' | 'right', mousePosition: Position | null, playerSide: PlayerSide): Hero => {
        const newHero = { ...hero };
        let newY = hero.position.y + hero.speed * hero.direction * 0.3;

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


    const updateSpellPosition = (spell: Spell): Position => {
        const distancePerFrame = GAME_CONSTANTS.SPELL_SPEED;
        const newX = spell.position.x + (spell.direction === 'right' ? distancePerFrame : -distancePerFrame);

        console.log(`Spell moved from ${spell.position.x} to ${newX}. Distance: ${Math.abs(newX - spell.position.x)}`);

        return {
            x: newX,
            y: spell.position.y
        };
    };

    const updateSpells = (state: GameState): { updatedSpells: Spell[], leftHit: boolean, rightHit: boolean } => {
        let leftHit = false;
        let rightHit = false;
        const updatedSpells = state.spells.filter(spell => {
            const newPosition = updateSpellPosition(spell);

            const isLeftSpell = spell.direction === 'right';
            const creator = isLeftSpell ? state.leftHero : state.rightHero;
            const target = isLeftSpell ? state.rightHero : state.leftHero;
            const distanceFromCreator = Math.abs(newPosition.x - creator.position.x);

            if (distanceFromCreator < creator.size.width * 2) {
                spell.position = newPosition;
                return true;
            }

            if (checkSpellCollision(newPosition, target)) {
                if (isLeftSpell) {
                    rightHit = true;
                } else {
                    leftHit = true;
                }
                return false;
            }
            spell.position = newPosition;
            return true;
        });

        ['left', 'right'].forEach(side => {
            const hero = side === 'left' ? state.leftHero : state.rightHero;
            if (Date.now() - hero.lastShotTime > 1000 / hero.fireRate) {
                updatedSpells.push({
                    position: {
                        x: hero.position.x + (side === 'left' ? hero.size.width : 0),
                        y: hero.position.y + hero.size.height / 2
                    },
                    size: { width: GAME_CONSTANTS.SPELL_SIZE, height: GAME_CONSTANTS.SPELL_SIZE },
                    color: hero.spellColor,
                    direction: side === 'left' ? 'right' : 'left'
                });
                hero.lastShotTime = Date.now();
            }
        });

        return { updatedSpells, leftHit, rightHit };
    };
    const checkSpellCollision = (spellPosition: Position, hero: Hero): boolean => {
        const collision = (
            spellPosition.x < hero.position.x + hero.size.width &&
            spellPosition.x + 10 > hero.position.x &&
            spellPosition.y < hero.position.y + hero.size.height &&
            spellPosition.y + 10 > hero.position.y
        );

        if (collision) {
            console.log(`Collision detected at position: (${spellPosition.x}, ${spellPosition.y})`);
        }

        return collision;
    };

    const drawGame = (context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, canvasSize.width, canvasSize.height);

        context.fillStyle = '#f0f0f0';
        context.fillRect(0, 0, canvasSize.width, canvasSize.height);

        drawHero(context, gameState.leftHero);
        drawHero(context, gameState.rightHero);

        gameState.spells.forEach(spell => drawSpell(context, spell));

        drawMouseLine(context);

        context.fillStyle = 'black';
        context.font = '14px Arial';
        context.fillText(debugMessage, 10, 20);
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
                speed: Math.max(GAME_CONSTANTS.HERO_MIN_SPEED, Math.min(GAME_CONSTANTS.HERO_MAX_SPEED, value))
            }
        }));
    }, []);

    const handleFireRateChange = useCallback((playerSide: PlayerSide, value: number) => {
        setGameState(prevState => ({
            ...prevState,
            [playerSide === 'left' ? 'leftHero' : 'rightHero']: {
                ...prevState[playerSide === 'left' ? 'leftHero' : 'rightHero'],
                fireRate: Math.max(GAME_CONSTANTS.FIRE_RATE_MIN, Math.min(GAME_CONSTANTS.FIRE_RATE_MAX, value))
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
