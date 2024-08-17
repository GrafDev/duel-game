// src/utils/collision.ts

import { Hero, Spell } from '../types';

export const checkCollision = (spell: Spell, hero: Hero): boolean => {
    // Простая проверка пересечения прямоугольников
    return (
        spell.position.x < hero.position.x + hero.size.width &&
        spell.position.x + spell.size.width > hero.position.x &&
        spell.position.y < hero.position.y + hero.size.height &&
        spell.position.y + spell.size.height > hero.position.y
    );
};
