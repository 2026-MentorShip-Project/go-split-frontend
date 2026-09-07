"use client";

interface DotProps {
  selected: boolean;
}

export default function Dot({ selected }: DotProps) {
  return selected ? (
    <span className="dot-sel">✓</span>
  ) : (
    <span className="dot-unsel" />
  );
}
