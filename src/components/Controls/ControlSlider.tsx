// src/components/ControlSlider.tsx

import React from 'react';
import styles from './Controls.module.css';

interface ControlSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    disabled?: boolean;
}

const ControlSlider: React.FC<ControlSliderProps> = ({
                                                         label,
                                                         value,
                                                         onChange,
                                                         min,
                                                         max,
                                                         step = 1,
                                                         disabled,
                                                     }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(event.target.value));
    };

    return (
        <div className={styles.control__slider}>
            <label>{label}: {value.toFixed(1)}</label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                disabled={disabled}
            />
        </div>
    )
};

export default ControlSlider;
