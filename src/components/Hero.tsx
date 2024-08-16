import React, { useState } from 'react';
import { useGameContext } from '../contexts/useGameContext';
import { Popover, PopoverTrigger, PopoverContent, Button, Input, Label } from './Game.tsx';

interface HeroMenuProps {
    heroId: number;
}

const Hero: React.FC<HeroMenuProps> = ({ heroId }) => {
    const { gameState, setGameState } = useGameContext();
    const [spellColor, setSpellColor] = useState(gameState?.player.spellColor || '#ffffff');

    const handleSpellColorChange = (color: string) => {
        setSpellColor(color);
        if (gameState) {
            const updatedState = {
                ...gameState,
                player: {
                    ...gameState.player,
                    spellColor: color,
                },
            };
            setGameState(updatedState);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">Hero {heroId} Settings</Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="space-y-4">
                    <h4 className="font-medium">Hero {heroId} Settings</h4>
                    <div className="space-y-2">
                        <Label htmlFor="spellColor">Spell Color</Label>
                        <Input
                            id="spellColor"
                            type="color"
                            value={spellColor}
                            onChange={(e) => handleSpellColorChange(e.target.value)}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default Hero;