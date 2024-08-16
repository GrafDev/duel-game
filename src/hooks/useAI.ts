import { useCallback, useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';

export const useAI = () => {
    const { gameState, setGameState } = useGameContext();

    const updateAI = useCallback(() => {
        // Логика движения AI
        setGameState(prevState => ({
            ...prevState,
            ai: {
                ...prevState.ai,
                y: prevState.ai.y + (Math.random() > 0.5 ? prevState.ai.speed : -prevState.ai.speed)
            }
        }));
    }, [setGameState]);

    const shootSpell = useCallback(() => {
        setGameState(prevState => ({
            ...prevState,
            spells: [...prevState.spells, { x: prevState.ai.x, y: prevState.ai.y, belongsTo: 'ai' }]
        }));
    }, [setGameState]);

    useEffect(() => {
        const interval = setInterval(() => {
            updateAI();
            if (Math.random() < 0.1) shootSpell();
        }, 100);
        return () => clearInterval(interval);
    }, [updateAI, shootSpell]);

    return { ai: gameState.ai };
};