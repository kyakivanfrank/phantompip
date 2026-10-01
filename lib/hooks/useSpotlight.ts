import React from 'react';

export function useSpotlight<T extends HTMLElement>() {
  return {
    onMouseMove: (e: React.MouseEvent<T>) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
  };
}
