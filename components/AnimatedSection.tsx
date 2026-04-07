import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'unveil' | 'unveil-left' | 'unveil-right' | 'unveil-scale';
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animationType = 'unveil',
  delay = 0
}) => {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`${className} ${animationType} ${isIntersecting ? 'animate' : ''}`}
      style={{
        transitionDelay: `${delay}s`,
        transitionTimingFunction: 'ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;