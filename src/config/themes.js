// src/config/themes.js
export const adultThemes = {
  minimalist: {
    bg: "bg-[#fafafa] text-neutral-800",
    card: "bg-white border border-neutral-200 shadow-sm",
    button: "bg-neutral-800 text-white hover:bg-neutral-700 transition",
  },
  cinematic: {
    bg: "bg-[#0c0c0c] text-white",
    card: "bg-[#1a1a1a] border border-[#2c2c2c]",
    button: "bg-[#e50914] text-white hover:bg-[#b00710] transition",
  },
  zen: {
    bg: "bg-[#f3f2ec] text-[#444]",
    card: "bg-white border border-[#dfdbcf]",
    button: "bg-[#93b58b] text-white hover:bg-[#82a67b] transition",
  },
  professional: {
    bg: "bg-[#f4f6f8] text-[#1a1a1a]",
    card: "bg-white border border-[#d0d7de]",
    button: "bg-[#2b2b52] text-white hover:bg-[#1f1f3b] transition",
  },
  vintage: {
    bg: "bg-[#fbf3e0] text-[#4b3b2b]",
    card: "bg-[#fff8e6] border border-[#e2cfa3]",
    button: "bg-[#c3a46d] text-white hover:bg-[#b18b58] transition",
  },
  focus: {
    bg: "bg-[#fdfdfd] text-[#111]",
    card: "bg-white border border-[#ddd]",
    button: "bg-[#0077cc] text-white hover:bg-[#0062a6] transition",
  },
  gray: {
    bg: "bg-[#f0f0f0] text-[#111]",
    card: "bg-white border border-[#ccc]",
    button: "bg-gray-500 text-white hover:bg-gray-600 transition",
  },
};

export const themeStyles = {
  minimalist: {
    base: "bg-neutral-800 hover:bg-neutral-700",
    stop: "bg-red-500 hover:bg-red-600",
    history: "bg-gray-600 hover:bg-gray-700",
  },
  cinematic: {
    base: "bg-red-700 hover:bg-red-800",
    stop: "bg-red-900 hover:bg-red-950",
    history: "bg-gray-800 hover:bg-gray-900",
  },
  zen: {
    base: "bg-emerald-600 hover:bg-emerald-700",
    stop: "bg-amber-700 hover:bg-amber-800",
    history: "bg-emerald-500 hover:bg-emerald-600",
  },
  professional: {
    base: "bg-blue-700 hover:bg-blue-800",
    stop: "bg-gray-700 hover:bg-gray-800",
    history: "bg-blue-500 hover:bg-blue-600",
  },
  vintage: {
    base: "bg-amber-600 hover:bg-amber-700",
    stop: "bg-orange-800 hover:bg-orange-900",
    history: "bg-amber-500 hover:bg-amber-600",
  },
  focus: {
    base: "bg-blue-600 hover:bg-blue-700",
    stop: "bg-blue-800 hover:bg-blue-900",
    history: "bg-blue-500 hover:bg-blue-600",
  },
  gray: {
    base: "bg-gray-500 hover:bg-gray-600",
    stop: "bg-gray-700 hover:bg-gray-800",
    history: "bg-gray-400 hover:bg-gray-500",
  },
};