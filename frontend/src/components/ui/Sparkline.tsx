"use client";

import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 40,
  color = "#fbbf24",
  fillColor = "rgba(251, 191, 36, 0.1)",
  strokeWidth = 2,
  className = "",
}: SparklineProps) {
  const { path, fillPath } = useMemo(() => {
    if (data.length === 0) return { path: "", fillPath: "" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });

    const pathData = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const fillPathData = `${pathData} L ${width} ${height} L 0 ${height} Z`;

    return { path: pathData, fillPath: fillPathData };
  }, [data, width, height]);

  if (data.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={fillPath}
        fill="url(#sparkline-gradient)"
        className="transition-all duration-300"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}