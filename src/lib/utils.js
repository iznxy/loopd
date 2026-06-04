import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function fmtN(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export function timeAgo(dateStr) {
  if (!dateStr) return "now";
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return diff + "s";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  return Math.floor(diff / 86400) + "d";
}

export function getInitials(name) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

export function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const AV_COLORS = [
  { bg: "#d4f5e9", text: "#0a6b4f" },
  { bg: "#fde8d8", text: "#a03d1c" },
  { bg: "#dbeeff", text: "#1560a0" },
  { bg: "#feeaff", text: "#892ba0" },
  { bg: "#fff3cd", text: "#8a6300" },
  { bg: "#ffd6d6", text: "#a00000" },
];

export function getAvColor(str) {
  if (!str) return AV_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AV_COLORS[Math.abs(hash) % AV_COLORS.length];
}