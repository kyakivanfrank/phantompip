'use client';

import { BackToTop } from './BackToTop';

interface AdminBackToTopProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  threshold?: number;
}

export function AdminBackToTop({ targetRef, threshold = 250 }: AdminBackToTopProps) {
  return (
    <BackToTop
      targetId="admin-main-scroll"
      targetRef={targetRef}
      threshold={threshold}
      accent="rose"
    />
  );
}
