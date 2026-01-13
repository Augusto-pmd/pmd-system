"use client";

import { useEffect, useRef } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 120,
  height = 24,
  color = "var(--pmd-accent)",
  strokeWidth = 1.5,
}: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = svgRef.current;
    const padding = 2;
    const w = width - padding * 2;
    const h = height - padding * 2;

    // Normalize data to fit within the height
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * w + padding;
      const y = h - ((value - min) / range) * h + padding;
      return `${x},${y}`;
    });

    const path = `M ${points.join(" L ")}`;

    // Create or update path
    let pathElement = svg.querySelector("path");
    if (!pathElement) {
      pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svg.appendChild(pathElement);
    }

    pathElement.setAttribute("d", path);
    pathElement.setAttribute("fill", "none");
    // Resolve CSS variable if needed
    const resolvedColor = color.startsWith("var(") 
      ? getComputedStyle(document.documentElement).getPropertyValue(color.slice(4, -1)).trim() || "#005bbb"
      : color;
    pathElement.setAttribute("stroke", resolvedColor);
    pathElement.setAttribute("stroke-width", String(strokeWidth));
    pathElement.setAttribute("opacity", "0");
    pathElement.setAttribute("stroke-linecap", "round");
    pathElement.setAttribute("stroke-linejoin", "round");
    
    // Animate opacity on mount
    pathElement.style.transition = "opacity var(--apple-duration-medium) var(--apple-ease-out)";
    setTimeout(() => {
      pathElement.setAttribute("opacity", "0.6");
    }, 50);
  }, [data, width, height, color, strokeWidth]);

  if (data.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: "transparent",
        }}
      />
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{
        display: "block",
        overflow: "visible",
      }}
    />
  );
}

