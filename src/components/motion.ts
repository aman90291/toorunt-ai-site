"use client";
/**
 * Central Motion import. `LazyMotion` + `domAnimation` + `m.*` keeps the
 * animation bundle to ~15KB and out of the shared chunk — every client
 * island imports `m` and `LazyMotion` from here, never `motion/react` directly.
 */
export { LazyMotion, domAnimation, m, AnimatePresence, useInView, useScroll, useTransform, useReducedMotion, useAnimate, useMotionValueEvent } from "motion/react";
