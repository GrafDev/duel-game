import {useCallback, useEffect, useRef} from 'react';
import { useGameContext } from '../contexts/GameContext';
import { usePlayer } from './usePlayer';
import { useAI } from './useAI';

export const useGameLoop = () => {
    const { gameState, setGameState } = useGameContext();
    const { movePlayer } = usePlayer();
    useAI(); // This will set up the AI logic

    const requestRef = useRef<number>();

    const animate = useCallback(() => {
        // Update game state (move spells, check collisions, etc.)
        setGameState(prevState => ({
            ...prevState,
            spells: prevState.spells.map(spell => ({
                ...spell,
                x: spell.belongsTo === 'player' ? spell.x + 5 : spell.x - 5
            }))
        }));

        requestRef.current = requestAnimationFrame(animate);
    }, [setGameState]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [animate]);

    return gameState;
};
