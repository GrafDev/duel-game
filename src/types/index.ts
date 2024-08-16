// src/types/index.ts

export type Position = {
    x: number;
    y: number;
};

export type Size = {
    width: number;
    height: number;
};

export type Hero = {
    position: Position;
    size: Size;
    color: string;
    spellColor: string;
    speed: number;
    fireRate: number;
};

export type Spell = {
    position: Position;
    size: Size;
    color: string;
    direction: 'left' | 'right';
};

export type PlayerSide = 'left' | 'right';

export type GameState = {
    leftHero: Hero;
    rightHero: Hero;
    spells: Spell[];
    score: {
        left: number;
        right: number;
    };
    playerSide: PlayerSide; // Добавляем это свойство
};

export type GameContextType = {
    gameState: GameState;
    updateGameState: (newState: Partial<GameState>) => void;
    canvasSize: Size;
};