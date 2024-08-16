import { useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';

export const usePlayer = () => {
    const { gameState, setGameState } = useGameContext();

    const movePlayer = useCallback((direction: 'up' | 'down') => {
        setGameState(prevState => ({
            ...prevState,
            player: {
                ...prevState.player,
                y: direction === 'up'
                    ? Math.max(0, prevState.player.y - prevState.player.speed)
                    : Math.min(600, prevState.player.y + prevState.player.speed)
            }
        }));
    }, [setGameState]);

    const shootSpell = useCallback(() => {
        setGameState(prevState => ({
            ...prevState,
            spells: [...prevState.spells, { x: prevState.player.x, y: prevState.player.y, belongsTo: 'player' }]
        }));
    }, [setGameState]);

    return { player: gameState.player, movePlayer, shootSpell };
};