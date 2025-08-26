import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Custom hook for performance optimizations
export function usePerformance() {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (timeSinceLastRender < 16) { // Less than 60fps
      console.warn(`Performance warning: Fast re-render detected (${timeSinceLastRender}ms)`);
    }
    
    lastRenderTime.current = now;
  });

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const throttle = useCallback((func: Function, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(null, args);
      }
    };
  }, []);

  const memoizedValue = useCallback((value: any, deps: any[]) => {
    return useMemo(() => value, deps);
  }, []);

  return {
    renderCount: renderCountRef.current,
    debounce,
    throttle,
    memoizedValue
  };
}

// HOC for performance optimization
export function withPerformance<T extends object>(Component: React.ComponentType<T>) {
  return React.memo((props: T) => {
    return <Component {...props} />;
  });
}

// Image lazy loading hook
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imageRef && imageSrc !== src) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options
        }
      );
      observer.observe(imageRef);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, imageSrc, options]);

  return [imageSrc, setImageRef] as const;
}