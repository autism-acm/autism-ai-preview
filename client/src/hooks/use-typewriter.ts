import { useState, useEffect, useRef } from 'react';

const phrases = [
  "explain meme coins like im sped",
  "do my homework 4 me, heres screnshot",
  "i lost all my moni in memcoin pls be frends with me now, my mommy is mad at me",
  "write me post for my memcoin heres a pictur",
  "is this ca gud? no rug? check rugscan pls",
  "Ask AUlon anything..."
];

export function useTypewriter() {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    
    const handleTyping = () => {
      if (isPaused) {
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, 5000);
        return;
      }

      if (!isDeleting) {
        if (text.length < currentPhrase.length) {
          setText(currentPhrase.slice(0, text.length + 1));
          timeoutRef.current = setTimeout(handleTyping, 50);
        } else {
          if (phraseIndex === phrases.length - 1) {
            setIsPaused(true);
          } else {
            timeoutRef.current = setTimeout(() => {
              setIsDeleting(true);
            }, 1000);
          }
        }
      } else {
        if (text.length > 0) {
          const deleteSpeed = Math.max(10, 50 - (currentPhrase.length - text.length) * 2);
          setText(currentPhrase.slice(0, text.length - 1));
          timeoutRef.current = setTimeout(handleTyping, deleteSpeed);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    };

    timeoutRef.current = setTimeout(handleTyping, isPaused ? 0 : 50);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, phraseIndex, isDeleting, isPaused]);

  return text;
}
