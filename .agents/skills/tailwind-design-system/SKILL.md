---
name: tailwind-design-system
description: Build scalable design systems with Tailwind CSS, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.
---

# Tailwind Design System

Build production-ready design systems with Tailwind CSS, including design tokens, component variants, responsive patterns, and accessibility.

## Use this skill when

- Creating a component library with Tailwind
- Implementing design tokens and theming
- Building responsive layouts and components
- Standardizing UI patterns across a project
- Designing Premium Interfaces (Glassmorphism, animations)

## Instructions

1. **Centralize Configuration**: Keep all tokens in `tailwind.config.js`. Avoid using vanilla CSS variables for tokens unless required for dynamic theming (and even then, map them to Tailwind correctly).
2. **Typography**: Always use modern typography (e.g. Inter, Outfit, Roboto).
3. **Micro-animations**: Use subtle animations on interactive elements (e.g., `transition-all duration-300 hover:-translate-y-1`).
4. **Glassmorphism**: Use `backdrop-blur` and semi-transparent backgrounds for modern aesthetics.
5. **Color Hierarchy**: Define primary, secondary, accent, and neutral colors.
6. **Avoid Generic Colors**: Use curated, harmonious color palettes.
