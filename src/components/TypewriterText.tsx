import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export default function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
  showCursor = true
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursorState, setShowCursorState] = useState(showCursor);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    setShowCursorState(showCursor);

    const startTimer = setTimeout(() => {
      let currentIndex = 0;
      
      const typeTimer = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeTimer);
          setIsComplete(true);
          
          setTimeout(() => {
            setShowCursorState(false);
            onComplete?.();
          }, 1000);
        }
      }, speed);

      return () => clearInterval(typeTimer);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, speed, delay, onComplete, showCursor]);

  return (
    <span className={cn('relative inline-block', className)}>
      <span className="whitespace-pre-wrap">{displayText}</span>
      {showCursorState && (
        <span className="inline-block w-0.5 h-[1em] bg-current ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

export function useTypewriter(text: string, speed: number = 50, delay: number = 0) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    setDisplayText('');
    setIsComplete(false);

    const startTimer = setTimeout(() => {
      let currentIndex = 0;
      
      const typeTimer = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeTimer);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(typeTimer);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, speed, delay]);

  return { displayText, isComplete };
}