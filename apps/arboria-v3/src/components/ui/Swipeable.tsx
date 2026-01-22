import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeableProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftActionLabel?: string;
    rightActionLabel?: string;
    leftActionIcon?: React.ReactNode;
    rightActionIcon?: React.ReactNode;
    leftActionClassName?: string;
    rightActionClassName?: string;
    className?: string;
    threshold?: number;
}

export function Swipeable({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftActionLabel,
    rightActionLabel,
    leftActionIcon,
    rightActionIcon,
    leftActionClassName,
    rightActionClassName,
    className,
    threshold = 100,
}: SwipeableProps) {
    const x = useMotionValue(0);
    const controls = useAnimation();
    const itemRef = useRef<HTMLDivElement>(null);

    // Fade background based on drag distance
    const leftOpacity = useTransform(x, [-threshold, -threshold / 2], [1, 0]);
    const rightOpacity = useTransform(x, [threshold / 2, threshold], [0, 1]);

    // Scale icon based on drag distance
    const leftScale = useTransform(x, [-threshold, -threshold / 2], [1, 0.5]);
    const rightScale = useTransform(x, [threshold / 2, threshold], [0.5, 1]);

    const handleDragEnd = async (_: any, info: any) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -threshold || (offset < -threshold / 2 && velocity < -500)) {
            // Swipe Left
            if (onSwipeLeft) {
                await controls.start({ x: -500, opacity: 0 });
                onSwipeLeft();
            } else {
                controls.start({ x: 0 });
            }
        } else if (offset > threshold || (offset > threshold / 2 && velocity > 500)) {
            // Swipe Right
            if (onSwipeRight) {
                await controls.start({ x: 500, opacity: 0 });
                onSwipeRight();
            } else {
                controls.start({ x: 0 });
            }
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <div className={cn("relative overflow-hidden w-full group", className)} ref={itemRef}>
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                {/* Right Action (revealed when swiping right) */}
                <motion.div
                    style={{ opacity: rightOpacity, scale: rightScale }}
                    className={cn(
                        "flex items-center justify-start h-full px-6 bg-blue-500 text-white w-full",
                        rightActionClassName
                    )}
                >
                    <div className="flex items-center gap-2">
                        {rightActionIcon}
                        <span className="text-xs font-bold uppercase tracking-wider">{rightActionLabel}</span>
                    </div>
                </motion.div>

                {/* Left Action (revealed when swiping left) */}
                <motion.div
                    style={{ opacity: leftOpacity, scale: leftScale }}
                    className={cn(
                        "flex items-center justify-end h-full px-6 bg-red-500 text-white w-full absolute right-0",
                        leftActionClassName
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider">{leftActionLabel}</span>
                        {leftActionIcon}
                    </div>
                </motion.div>
            </div>

            {/* Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: onSwipeLeft ? -1000 : 0, right: onSwipeRight ? 1000 : 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className="relative z-10 bg-card cursor-grab active:cursor-grabbing w-full"
            >
                {children}
            </motion.div>
        </div>
    );
}
