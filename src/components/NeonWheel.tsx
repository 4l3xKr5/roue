import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Segment {
  id: number;
  label: string;
  color: string;
  textColor?: string;
}

interface NeonWheelProps {
  segments: Segment[];
  winnerIndex: number | null;
  onSpinEnd?: (winner: Segment) => void;
  className?: string;
}

const NeonWheel: React.FC<NeonWheelProps> = ({ 
  segments, 
  winnerIndex, 
  onSpinEnd,
  className 
}) => {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const count = segments.length;
  const segmentAngle = 360 / count;

  const totalRotation = React.useRef(0);

  const spin = async () => {
    if (winnerIndex === null || isSpinning) return;

    setIsSpinning(true);

    // Calculate the normalized target angle for the winner
    // (where the winner segment center should be at the top/0deg)
    const targetAngle = (360 - (winnerIndex * segmentAngle + segmentAngle / 2));
    
    // Add full spins to the CURRENT total rotation to ensure it always spins forward
    const currentRotation = totalRotation.current;
    const extraSpins = 5 * 360;
    
    // Calculate how much we need to add to get to the next targetAngle
    // We want (currentRotation + addedRotation) % 360 to be targetAngle
    const currentNormalized = currentRotation % 360;
    let addedRotation = targetAngle - currentNormalized;
    if (addedRotation <= 0) addedRotation += 360;
    
    const finalRotation = currentRotation + extraSpins + addedRotation;
    totalRotation.current = finalRotation;

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 6,
        ease: [0.15, 0, 0.1, 1], // Smooth custom deceleration
      },
    });

    // Subtle vibration/bounce at the end
    await controls.start({
      rotate: [finalRotation, finalRotation + 1, finalRotation - 1, finalRotation],
      transition: { duration: 0.3 }
    });

    setIsSpinning(false);
    onSpinEnd?.(segments[winnerIndex]);
  };

  useEffect(() => {
    if (winnerIndex !== null) {
      spin();
    }
  }, [winnerIndex]);

  // SVG drawing helpers
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className={cn("relative flex items-center justify-center p-4", className)}>
      {/* SVG Filters for Neon Glow */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="outer-neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* The Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
        <motion.div 
          animate={isSpinning ? { y: [0, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.2 }}
          className="w-10 h-10 bg-neon-pink rounded-full flex items-center justify-center shadow-[0_0_20px_#FF00FF] border-2 border-white"
        >
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-white mt-4" />
        </motion.div>
      </div>

      {/* The Wheel */}
      <motion.div
        animate={controls}
        initial={{ rotate: 0 }}
        className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border-8 border-street-gray shadow-[0_0_50px_rgba(255,0,255,0.2)]"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        >
          {segments.map((segment, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            const midAngle = startAngle + segmentAngle / 2;

            return (
              <g key={segment.id}>
                <path
                  d={describeArc(50, 50, 48, startAngle, endAngle)}
                  fill={segment.color}
                  stroke="#000"
                  strokeWidth="0.5"
                />
                <g style={{ transform: `rotate(${midAngle}deg)`, transformOrigin: '50px 50px' }}>
                     <text
                        x="50"
                        y="20"
                        fill={segment.textColor || "white"}
                        fontSize="5"
                        fontWeight="900"
                        textAnchor="middle"
                        className="align-middle pointer-events-none select-none tracking-tight"
                        style={{ filter: "drop-shadow(0 0 2px black)" }}
                      >
                        {segment.label}
                      </text>
                </g>
              </g>
            );
          })}
          
          {/* Inner Circle / Pivot */}
          <circle cx="50" cy="50" r="8" fill="#050505" stroke="#FF00FF" strokeWidth="1" className="glow-filter" />
          <circle cx="50" cy="50" r="4" fill="#FF00FF" className="animate-pulse shadow-[0_0_10px_#FF00FF]" />
        </svg>
      </motion.div>

      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border-[12px] border-transparent shadow-[0_0_20px_#00FFFF,inset_0_0_20px_#00FFFF] pointer-events-none opacity-30" />
    </div>
  );
};

export default NeonWheel;
