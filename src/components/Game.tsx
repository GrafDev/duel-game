import React, {useState, useEffect, useRef, useCallback} from 'react';
import {GameState, Hero, Spell, PlayerSide, Position} from '../types';
import ScoreBoard from "./ScoreBoard/ScoreBoard";
import PlayerSelection from "./PlayerSelection/PlayerSelection";
import Controls from "./Controls/Controls";
import styles from './Game.module.css';
import {useMouseInteraction} from "../hooks/useMouseInteraction";
import ColorMenu from "./ColorMenu/ColorMenu.tsx";

const GAME_CONSTANTS = {
    FPS: 60,
    HERO_SIZE: 40,
    SPELL_SIZE: 10,
    SPELL_SPEED: 100, // pixels per second
    DEFAULT_FIRE_RATE: 3,
    HERO_MIN_SPEED: 50,
    HERO_MAX_SPEED: 200,
    FIRE_RATE_MIN: 0.5,
    FIRE_RATE_MAX: 5,
    CANVAS_WIDTH_RATIO: 0.8,
    CANVAS_HEIGHT_RATIO: 0.7,
    HIT_DURATION: 100, // миллисекунды
    NORMAL_BORDER_WIDTH: 2,
    HIT_BORDER_WIDTH: 4,
};

const createHero = (side: 'left' | 'right', canvasWidth: number, canvasHeight: number): Hero => ({
    position: {
        x: side === 'left' ? GAME_CONSTANTS.HERO_SIZE : canvasWidth - GAME_CONSTANTS.HERO_SIZE * 2,
        y: canvasHeight / 2
    },
    size: {width: GAME_CONSTANTS.HERO_SIZE, height: GAME_CONSTANTS.HERO_SIZE},
    color: side === 'left' ? 'yellow' : 'green',
    spellColor: side === 'left' ? 'gold' : 'lightgreen',
    speed: 100,
    fireRate: GAME_CONSTANTS.DEFAULT_FIRE_RATE,
    direction: side === 'left' ? -1 : 1,
    aiDirectionChangeInterval: 0,
    aiSpeedChangeInterval: 0,
    lastShotTime: 0,
    isHit: false,
    hitTime: 0,
    borderWidth: GAME_CONSTANTS.NORMAL_BORDER_WIDTH,
    borderColor: 'black',
});

const createInitialGameState = (canvasWidth: number, canvasHeight: number): GameState => ({
    leftHero: createHero('left', canvasWidth, canvasHeight),
    rightHero: createHero('right', canvasWidth, canvasHeight),
    spells: [],
    score: {left: 0, right: 0},
    playerSide: 'left' as PlayerSide
});

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [canvasSize, setCanvasSize] = useState({width: 800, height: 600});
    const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(canvasSize.width, canvasSize.height));
    const {drawMouseLine, getMousePosition} = useMouseInteraction();
    const lastUpdateTimeRef = useRef<number>(Date.now());
    const animationFrameRef = useRef<number>();
    const [openColorMenu, setOpenColorMenu] = useState<PlayerSide | null>(null);

    const updateCanvasSize = useCallback(() => {
        const width = Math.floor(window.innerWidth * GAME_CONSTANTS.CANVAS_WIDTH_RATIO);
        const height = Math.floor(window.innerHeight * GAME_CONSTANTS.CANVAS_HEIGHT_RATIO);
        setCanvasSize({width, height});
        setGameState(prevState => ({
            ...prevState,
            leftHero: {...prevState.leftHero, position: {x: GAME_CONSTANTS.HERO_SIZE, y: height / 2}},
            rightHero: {...prevState.rightHero, position: {x: width - GAME_CONSTANTS.HERO_SIZE * 2, y: height / 2}}
        }));
    }, []);

    useEffect(() => {
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [updateCanvasSize]);

    const updateHeroPosition = useCallback((hero: Hero, side: 'left' | 'right', mousePosition: Position | null, playerSide: PlayerSide, deltaTime: number): Hero => {
        const newHero = {...hero};
        let newY = hero.position.y + hero.speed * hero.direction * deltaTime;

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
                const vectorY = heroCenter.y - mousePosition.y;
                const length = Math.abs(vectorY);
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
        newHero.position.x = side === 'left' ? GAME_CONSTANTS.HERO_SIZE : canvasSize.width - GAME_CONSTANTS.HERO_SIZE * 2;

        return newHero;
    }, [canvasSize.height, canvasSize.width]);

    const createNewSpell = useCallback((hero: Hero, side: 'left' | 'right'): Spell => ({
        position: {
            x: hero.position.x + (side === 'left' ? hero.size.width : 0),
            y: hero.position.y + hero.size.height / 2
        },
        size: {width: GAME_CONSTANTS.SPELL_SIZE, height: GAME_CONSTANTS.SPELL_SIZE},
        color: hero.spellColor,
        direction: side === 'left' ? 'right' : 'left'
    }), []);

    const updateSpells = useCallback((state: GameState, deltaTime: number): {
        updatedSpells: Spell[],
        leftHit: boolean,
        rightHit: boolean
    } => {
        let leftHit = false;
        let rightHit = false;
        const updatedSpells = state.spells.filter(spell => {
            const newX = spell.position.x + (spell.direction === 'right' ? 1 : -1) * GAME_CONSTANTS.SPELL_SPEED * deltaTime;
            const newPosition = {...spell.position, x: newX};

            const isLeftSpell = spell.direction === 'right';
            const target = isLeftSpell ? state.rightHero : state.leftHero;

            if (
                newPosition.x < target.position.x + target.size.width &&
                newPosition.x + spell.size.width > target.position.x &&
                newPosition.y < target.position.y + target.size.height &&
                newPosition.y + spell.size.height > target.position.y
            ) {
                if (isLeftSpell) rightHit = true;
                else leftHit = true;
                return false;
            }

            if (newX < 0 || newX > canvasSize.width) return false;

            spell.position = newPosition;
            return true;
        });

        ['left', 'right'].forEach(side => {
            const hero = side === 'left' ? state.leftHero : state.rightHero;
            if (Date.now() - hero.lastShotTime > 1000 / hero.fireRate) {
                updatedSpells.push(createNewSpell(hero, side as 'left' | 'right'));
                hero.lastShotTime = Date.now();
            }
        });

        return {updatedSpells, leftHit, rightHit};
    }, [canvasSize.width, createNewSpell]);

    const updateGame = useCallback(() => {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000;
        lastUpdateTimeRef.current = currentTime;

        setGameState(prevState => {
            const newState = {...prevState};
            const mousePosition = getMousePosition();

            // Обновление состояния попадания
            ['leftHero', 'rightHero'].forEach((heroKey) => {
                const hero = newState[heroKey as 'leftHero' | 'rightHero'];
                if (hero.isHit && currentTime - hero.hitTime > GAME_CONSTANTS.HIT_DURATION) {
                    hero.isHit = false;
                    hero.borderWidth = GAME_CONSTANTS.NORMAL_BORDER_WIDTH;
                    hero.borderColor = 'black';
                }
            });

            newState.leftHero = updateHeroPosition(newState.leftHero, 'left', mousePosition, newState.playerSide, deltaTime);
            newState.rightHero = updateHeroPosition(newState.rightHero, 'right', mousePosition, newState.playerSide, deltaTime);

            const aiSide = newState.playerSide === 'left' ? 'right' : 'left';
            const aiHero = aiSide === 'left' ? newState.leftHero : newState.rightHero;

            if (aiHero.aiDirectionChangeInterval <= 0) {
                aiHero.direction = Math.random() < 0.5 ? 1 : -1;
                aiHero.aiDirectionChangeInterval = Math.floor(Math.random() * 120) + 60;
            } else {
                aiHero.aiDirectionChangeInterval--;
            }

            if (aiHero.aiSpeedChangeInterval <= 0) {
                aiHero.speed = Math.random() * (GAME_CONSTANTS.HERO_MAX_SPEED - GAME_CONSTANTS.HERO_MIN_SPEED) + GAME_CONSTANTS.HERO_MIN_SPEED;
                aiHero.aiSpeedChangeInterval = Math.floor(Math.random() * 300) + 60;
            } else {
                aiHero.aiSpeedChangeInterval--;
            }

            const {updatedSpells, leftHit, rightHit} = updateSpells(newState, deltaTime);
            newState.spells = updatedSpells;

            if (leftHit) {
                newState.score.right++;
                newState.leftHero.isHit = true;
                newState.leftHero.hitTime = currentTime;
                newState.leftHero.borderWidth = GAME_CONSTANTS.HIT_BORDER_WIDTH;
                newState.leftHero.borderColor = 'red';
            }

            if (rightHit) {
                newState.score.left++;
                newState.rightHero.isHit = true;
                newState.rightHero.hitTime = currentTime;
                newState.rightHero.borderWidth = GAME_CONSTANTS.HIT_BORDER_WIDTH;
                newState.rightHero.borderColor = 'red';
            }

            return newState;
        });
    }, [getMousePosition, updateHeroPosition, updateSpells]);

    const handleSideClick = useCallback((side: PlayerSide) => {
        setOpenColorMenu(prevSide => prevSide === side ? null : side);
    }, []);

    const handleColorChange = useCallback((side: PlayerSide, color: string) => {
        setGameState(prevState => ({
            ...prevState,
            [side === 'left' ? 'leftHero' : 'rightHero']: {
                ...prevState[side === 'left' ? 'leftHero' : 'rightHero'],
                spellColor: color
            }
        }));
    }, []);
    const drawGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvasSize.width, canvasSize.height);
        context.fillStyle = '#f0f0f0';
        context.fillRect(0, 0, canvasSize.width, canvasSize.height);

        const drawHero = (hero: Hero) => {
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
            context.strokeStyle = hero.borderColor;
            context.lineWidth = hero.borderWidth;
            context.stroke();
        };


        const drawSpell = (spell: Spell) => {
            context.fillStyle = spell.color;
            context.beginPath();
            context.arc(
                spell.position.x + spell.size.width / 2,
                spell.position.y + spell.size.height / 2,
                spell.size.width / 2,
                0,
                2 * Math.PI
            );
            context.fill();
            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.stroke();
        };

        drawHero(gameState.leftHero);
        drawHero(gameState.rightHero);
        gameState.spells.forEach(drawSpell);

        drawMouseLine(context);

        context.fillStyle = 'black';
        context.font = '14px Arial';
        drawMouseLine(context);
        canvas.onclick = (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;

            if (x < canvasSize.width / 2) {
                handleSideClick('left');
            } else {
                handleSideClick('right');
            }
        };
    }, [canvasSize.width, canvasSize.height, gameState, drawMouseLine, handleSideClick]);

    useEffect(() => {
        if (!gameStarted) return;

        const gameLoop = () => {
            updateGame();
            drawGame();
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };

        animationFrameRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameStarted, updateGame, drawGame]);

    const handleExit = useCallback(() => {
        setGameState(createInitialGameState(canvasSize.width, canvasSize.height));
        setGameStarted(false);
    }, [canvasSize.height, canvasSize.width]);

    const handleSelectSide = useCallback((playerSide: PlayerSide) => {
        setGameState(prevState => ({...prevState, playerSide}));
        setGameStarted(true);
    }, []);

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
    const handleMouseEnter = useCallback(() => {
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'none';
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
        }
    }, []);

    if (!gameStarted) {
        return <PlayerSelection onSelectSide={handleSelectSide}/>;
    }
    return (
        <div className={styles.game}>
            <ScoreBoard gameState={gameState} handleExit={handleExit}/>
            <div className={styles.field}>
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{
                        border: '2px solid black',
                        marginTop: '20px',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
                {openColorMenu && (
                    <ColorMenu
                        side={openColorMenu}
                        currentColor={gameState[openColorMenu === 'left' ? 'leftHero' : 'rightHero'].spellColor}
                        onColorChange={handleColorChange}
                    />
                )}
            </div>
            <div className={styles.controls}>
                <Controls
                    gameState={gameState}
                    onSpeedChange={handleSpeedChange}
                    onFireRateChange={handleFireRateChange}
                />
            </div>
        </div>
    );
};

export default Game;
