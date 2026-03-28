"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  baseWidth?: number;   // letter-like base width
  baseHeight?: number;  // letter-like base height
  padding?: number;
  minScale?: number;
  maxScale?: number;
};

export default function ResizablePreview({
  children,
  baseWidth = 816,
  baseHeight = 1056,
  padding = 24,
  minScale = 0.55,
  maxScale = 1.1,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 1000, h: 800 });

  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setSize({ w: rect.width, h: rect.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => {
    const wAvail = Math.max(0, size.w - padding * 2);
    const hAvail = Math.max(0, size.h - padding * 2);

    const sW = wAvail / baseWidth;
    const sH = hAvail / baseHeight;
    const s = Math.min(sW, sH);

    return Math.max(minScale, Math.min(maxScale, s));
  }, [size.w, size.h, padding, baseWidth, baseHeight, minScale, maxScale]);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <div className="flex h-full w-full items-start justify-center overflow-auto p-6">
        <div
          className="origin-top-left"
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
