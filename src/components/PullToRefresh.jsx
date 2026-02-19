import React, { useState, useRef, useCallback } from "react";

const PULL_THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children, className = "" }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(delta * 0.5, PULL_THRESHOLD + 20));
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      await onRefresh();
      setIsRefreshing(false);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = null;
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ overscrollBehavior: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center transition-all duration-200"
          style={{ height: isRefreshing ? 48 : pullDistance, overflow: "hidden" }}
        >
          <div
            className={`w-7 h-7 rounded-full border-2 border-purple-600 border-t-transparent ${isRefreshing ? "animate-spin" : ""}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}
      {children}
    </div>
  );
}