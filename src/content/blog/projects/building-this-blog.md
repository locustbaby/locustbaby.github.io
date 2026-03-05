---
title: "Building This Blog"
date: "2025-03-05"
category: "projects"
excerpt: "Technical breakdown of how this site was built with Astro, Three.js, and custom GLSL shaders."
tags: ["astro", "threejs", "glsl", "webgl"]
---

## Stack

- **Astro** — Static site generation with Markdown content
- **Three.js** — WebGL rendering for background effects
- **GLSL Shaders** — Custom vertex and fragment shaders for the fluid noise effect
- **GSAP** — Animation orchestration and scroll-triggered reveals

## The Background Effect

The animated background uses a custom shader based on 3D simplex noise. The vertex shader displaces a subdivided plane mesh based on noise values that evolve over time, while the fragment shader maps the distortion to a two-color gradient.

Mouse position is passed as a uniform, creating subtle interaction — the noise amplitude increases near the cursor.

## Category Theming

Each content category has its own color palette that gets injected into the shader uniforms. When you navigate between categories, the colors smoothly transition.

## Performance

The key to keeping this smooth is:

- Limiting pixel ratio to 2x max
- Using `AdditiveBlending` for particles (cheaper than alpha blending)
- Keeping polygon count reasonable (128x128 plane subdivisions)
- No post-processing passes

## What's Next

- Custom 3D models via Blender
- Page transition animations
- More distinctive per-category visual effects
