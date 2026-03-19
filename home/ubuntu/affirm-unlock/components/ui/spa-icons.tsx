/**
 * Custom SVG icons for AffirmUnlock — gentle, organic, spa-inspired line art.
 * All icons use `currentColor` so they inherit the parent's text color.
 */
import React from "react";
import Svg, { Path, Circle, Line, Polyline, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const defaults: Required<IconProps> = {
  size: 24,
  color: "#8C7B6B",
  strokeWidth: 1.6,
};

// ── Home / Dwelling ──────────────────────────────────────────────────────────
export function HomeIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12h6v10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Lotus / Affirmations ─────────────────────────────────────────────────────
export function LotusIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Centre petal */}
      <Path
        d="M12 18C12 18 9 14 9 10.5C9 8.5 10.5 7 12 7C13.5 7 15 8.5 15 10.5C15 14 12 18 12 18Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left petal */}
      <Path
        d="M12 18C12 18 7 15.5 6 12C5.5 10 6.5 8 8 7.5C9.5 7 11 8 11.5 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right petal */}
      <Path
        d="M12 18C12 18 17 15.5 18 12C18.5 10 17.5 8 16 7.5C14.5 7 13 8 12.5 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base leaves */}
      <Path
        d="M7 18C7 18 8.5 16.5 12 17C15.5 17.5 17 18 17 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Settings / Leaf spiral ───────────────────────────────────────────────────
export function SettingsIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Microphone ───────────────────────────────────────────────────────────────
export function MicIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="9" y="2" width="6" height="11" rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 10a7 7 0 0014 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="9" y1="22" x2="15" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

// ── Lock (closed) ────────────────────────────────────────────────────────────
export function LockIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="11" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M8 11V7a4 4 0 018 0v4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="16" r="1" fill={color} />
    </Svg>
  );
}

// ── Unlock (open lock) ───────────────────────────────────────────────────────
export function UnlockIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="11" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M8 11V7a4 4 0 017.9-.9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="16" r="1" fill={color} />
    </Svg>
  );
}

// ── Checkmark circle ─────────────────────────────────────────────────────────
export function CheckCircleIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M8 12l3 3 5-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── X circle (error / fail) ──────────────────────────────────────────────────
export function XCircleIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M9 9l6 6M15 9l-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

// ── Plus circle (add) ────────────────────────────────────────────────────────
export function PlusCircleIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

// ── Trash / Delete ───────────────────────────────────────────────────────────
export function TrashIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Pencil / Edit ────────────────────────────────────────────────────────────
export function PencilIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Bell / Notification ──────────────────────────────────────────────────────
export function BellIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Leaf (nature / calm) ─────────────────────────────────────────────────────
export function LeafIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.69 21C8 20 17 17 20 8C20 8 18 7 17 8Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M3.5 21C3.5 21 8 17 12 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

// ── Sun / Morning ────────────────────────────────────────────────────────────
export function SunIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── Flame / Streak ───────────────────────────────────────────────────────────
export function FlameIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 14.5A5.5 5.5 0 0014 9c0-2.5-1.5-4-2-5.5C11.5 5 10 6.5 10 8.5c0 1-.5 2-1.5 2.5C7.5 11.5 7 12.5 7 13.5A5 5 0 0012 19a5 5 0 004.5-7.5C15.5 13 14 13.5 13 13c-.5-.5-.5-1.5 0-2.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Chevron right ────────────────────────────────────────────────────────────
export function ChevronRightIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Wave / Sound ─────────────────────────────────────────────────────────────
export function WaveIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12c1.5-3 3-4.5 4-4.5S8 9 9 12s1.5 4.5 2.5 4.5S14 15 15 12s1.5-4.5 2.5-4.5S20 9 22 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Chevron up ───────────────────────────────────────────────────────────────
export function ChevronUpIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Chevron down ─────────────────────────────────────────────────────────────
export function ChevronDownIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
