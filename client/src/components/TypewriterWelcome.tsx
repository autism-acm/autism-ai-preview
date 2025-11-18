import { useState, useEffect, useRef, useMemo } from 'react';

interface TypewriterWelcomeProps {
  hasMessages: boolean;
}

export default function TypewriterWelcome({ hasMessages }: TypewriterWelcomeProps) {
  const [text, setText] = useState('');
  const [hiCount, setHiCount] = useState(0);
  const fullText = "Hi... I'm AUlon hihi... Hi...";
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const particles = useMemo(() => {
    const particleCount = 300;
    return Array.from({ length: particleCount }, (_, i) => {
      const z = Math.random() * 360;
      const y = Math.random() * 360;
      const progress = i / particleCount;
      const color = progress < 0.5 
        ? `rgb(${Math.round(239 - (239-212) * progress * 2)}, ${Math.round(191 - (191-175) * progress * 2)}, ${Math.round(4 + (55-4) * progress * 2)})`
        : `rgb(${Math.round(212 - (212-122) * (progress - 0.5) * 2)}, ${Math.round(175 - (175-97) * (progress - 0.5) * 2)}, ${Math.round(55 - (55-0) * (progress - 0.5) * 2)})`;
      return { z, y, color, delay: i * 0.01 };
    });
  }, []);

  useEffect(() => {
    if (!hasMessages) {
      setText('');
      setCurrentIndex(0);
      setHiCount(0);
    }
  }, [hasMessages]);

  useEffect(() => {
    if (hasMessages) {
      return;
    }

    if (currentIndex < fullText.length) {
      timeoutRef.current = setTimeout(() => {
        setText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
    } else if (hiCount < 4) {
      const randomDelay = Math.random() * 20000 + 10000;
      timeoutRef.current = setTimeout(() => {
        setText(prev => prev + ' Hi...');
        setHiCount(hiCount + 1);
      }, randomDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, hiCount, fullText, hasMessages]);

  if (hasMessages) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-[90vw] max-w-4xl" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="orb-wrap">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  animationDelay: `${particle.delay}s`,
                  backgroundColor: particle.color,
                  '--z': `${particle.z}deg`,
                  '--y': `${particle.y}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes rotate {
          100% {
            transform: rotateY(360deg) rotateX(360deg);
          }
        }

        @keyframes orbit {
          20% {
            opacity: 1;
          }
          30% {
            transform: rotateZ(calc(-1 * var(--z))) rotateY(var(--y)) translateX(100px) rotateZ(var(--z));
          }
          80% {
            transform: rotateZ(calc(-1 * var(--z))) rotateY(var(--y)) translateX(100px) rotateZ(var(--z));
            opacity: 1;
          }
          100% {
            transform: rotateZ(calc(-1 * var(--z))) rotateY(var(--y)) translateX(300px) rotateZ(var(--z));
          }
        }

        .orb-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          transform-style: preserve-3d;
          perspective: 1000px;
          animation: rotate 14s infinite linear;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          opacity: 0;
          animation: orbit 14s infinite;
        }
      `}</style>
    </div>
  );
}
