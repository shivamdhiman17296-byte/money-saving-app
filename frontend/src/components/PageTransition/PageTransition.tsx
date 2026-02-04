import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade-up' | 'fade-left' | 'blur-reveal' | 'scale' | 'fade-right' | 'smooth-scale';
}

const animationClasses = {
  'fade-up': 'page-enter',
  'fade-left': 'page-enter-flip',
  'blur-reveal': 'page-enter-zoom-rotate',
  'scale': 'page-enter-cube',
  'fade-right': 'page-enter-perspective',
  'smooth-scale': 'page-enter-slide-rotate'
};

const exitAnimationClasses = {
  'fade-up': 'page-exit',
  'fade-left': 'page-exit-flip',
  'blur-reveal': 'page-exit-zoom-rotate',
  'scale': 'page-exit-cube',
  'fade-right': 'page-exit-perspective',
  'smooth-scale': 'page-exit-slide-rotate'
};

export default function PageTransition({ 
  children, 
  transitionType = 'fade-up' 
}: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={`page-container ${
        !isTransitioning ? animationClasses[transitionType] : exitAnimationClasses[transitionType]
      }`}
    >
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}
