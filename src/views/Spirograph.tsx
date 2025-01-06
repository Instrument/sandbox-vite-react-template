import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Slider } from "@/components/ui/slider.jsx";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

const SpirographGenerator = () => {
  const [outerRadius, setOuterRadius] = useState(80);
  const [innerRadius, setInnerRadius] = useState(50);
  const [offset, setOffset] = useState(35);
  const [rotations, setRotations] = useState(50);
  const [color, setColor] = useState("#FF0000");
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(1);
  const animationRef = useRef(null);

  // Calculate GCD for determining number of rotations needed
  const gcd = (a, b) => {
    return b === 0 ? a : gcd(b, a % b);
  };

  // Calculate points for the spirograph
  const calculatePoints = () => {
    const points = [];
    const R = outerRadius;
    const r = innerRadius;
    const o = offset;

    // Use many more steps for smoother curves
    const steps = Math.ceil(2 * Math.PI * rotations * 100);

    for (let t = 0; t <= steps; t += 1) {
      const theta = (t / steps) * (2 * Math.PI * rotations);

      // Parametric equations for hypotrochoid
      const x = (R - r) * Math.cos(theta) + o * Math.cos(((R - r) * theta) / r);
      const y = (R - r) * Math.sin(theta) - o * Math.sin(((R - r) * theta) / r);

      points.push({ x, y });
    }

    return points;
  };

  // Draw the spirograph
  const drawSpirograph = (currentProgress = 1) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const points = calculatePoints();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale to fit pattern in canvas
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;
    const scale = Math.min(
      (canvas.width - 40) / width,
      (canvas.height - 40) / height
    );

    // Draw the pattern
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Only draw up to the current progress point
    const pointsToDraw = Math.floor(points.length * currentProgress);

    points.slice(0, pointsToDraw).forEach((point, i) => {
      const x = (point.x - minX) * scale + 20;
      const y = (point.y - minY) * scale + 20;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  };

  // Add animation functions
  const animate = (timestamp) => {
    if (!animationRef.current) {
      animationRef.current = timestamp;
    }

    const elapsed = timestamp - animationRef.current;
    // Animation duration: 3 seconds
    const duration = 3000;

    const newProgress = Math.min(elapsed / duration, 1);
    setProgress(newProgress);
    drawSpirograph(newProgress);

    if (newProgress < 1) {
      requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      animationRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      drawSpirograph(1); // Draw complete pattern
    } else {
      setIsPlaying(true);
      setProgress(0);
      requestAnimationFrame(animate);
    }
  };

  // Modify the useEffect to use progress
  useEffect(() => {
    if (!isPlaying) {
      drawSpirograph(1);
    }
  }, [outerRadius, innerRadius, offset, rotations, color]);

  const exportSVG = () => {
    const points = calculatePoints();

    // Calculate bounds
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;

    // Create SVG path data
    const pathData = points
      .map((point, i) => {
        const x = point.x - minX;
        const y = point.y - minY;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    // Create SVG content
    const svgContent = `
      <svg 
        width="${width}" 
        height="${height}" 
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="${pathData}"
          stroke="${color}"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    `;

    // Create download link
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spirograph.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Interactive Spirograph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="border border-gray-200 rounded-lg w-full bg-white mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={togglePlay} className="flex-1">
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4 mr-2" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Play
                  </>
                )}
              </Button>
              <Button onClick={exportSVG} className="flex-1">
                Export as SVG
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Outer Radius: {outerRadius}
              </label>
              <Slider
                value={[outerRadius]}
                onValueChange={(value) => setOuterRadius(value[0])}
                min={20}
                max={150}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Inner Radius: {innerRadius}
              </label>
              <Slider
                value={[innerRadius]}
                onValueChange={(value) => setInnerRadius(value[0])}
                min={10}
                max={100}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Offset: {offset}
              </label>
              <Slider
                value={[offset]}
                onValueChange={(value) => setOffset(value[0])}
                min={5}
                max={100}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rotations: {rotations}
              </label>
              <Slider
                value={[rotations]}
                onValueChange={(value) => setRotations(value[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpirographGenerator;
