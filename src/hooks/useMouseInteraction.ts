import { useEffect, useRef, useCallback } from 'react';
import { Position } from '../types';

const MOUSE_LINE_WIDTH = 40;

export const useMouseInteraction = () => {
    const mousePositionRef = useRef<Position | null>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        mousePositionRef.current = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseMove]);

    const drawMouseLine = useCallback((ctx: CanvasRenderingContext2D) => {
        if (mousePositionRef.current) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(mousePositionRef.current.x - MOUSE_LINE_WIDTH / 2, mousePositionRef.current.y);
            ctx.lineTo(mousePositionRef.current.x + MOUSE_LINE_WIDTH / 2, mousePositionRef.current.y);
            ctx.stroke();
            ctx.restore();
        }
    }, []);

    const getMousePosition = useCallback(() => mousePositionRef.current, []);

    return { drawMouseLine, getMousePosition };
};
