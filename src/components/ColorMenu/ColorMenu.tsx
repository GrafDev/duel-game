import React from 'react';
import { PlayerSide } from "../../types";
import styles from './ColorMenu.module.css';

interface ColorMenuProps {
    side: PlayerSide;
    currentColor: string;
    onColorChange: (side: PlayerSide, color: string) => void;
}

const ColorMenu: React.FC<ColorMenuProps> = ({ side, currentColor, onColorChange }) => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

    return (
        <div className={`${styles.colorMenu} ${side === 'left' ? styles.colorMenuLeft : styles.colorMenuRight}`}>
            <h3 className={styles.title}>Выберите цвет заклинаний</h3>
            <div className={styles.colorGrid}>
                {colors.map(color => (
                    <div
                        key={color}
                        className={`${styles.colorOption} ${color === currentColor ? styles.colorOptionSelected : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorChange(side, color)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ColorMenu;
