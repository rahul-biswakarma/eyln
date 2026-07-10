import type React from "react";

/** A single auto-graded quiz question. */
export interface QuizQuestion {
  q: string;
  /** Multiple-choice options. Omit for numeric questions. */
  choices?: string[];
  /** Index into `choices` for MC, or a number for numeric questions. */
  answer: number;
  /** Tolerance for numeric answers (default 0.001). */
  tolerance?: number;
  explain: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export type ExerciseKind = "wgsl" | "ts" | "predict" | "numeric" | "open" | "code-open";

export interface ExerciseResult {
  pass: boolean;
  message: string;
  /** Longer LLM feedback, shown below the pass/fail line for open exercises. */
  feedback?: string;
}

export interface Exercise {
  id: string;
  prompt: string;
  kind: ExerciseKind;
  starter: string;
  /**
   * For deterministic kinds ("predict"/"numeric"/"wgsl"/"ts"): validates the raw input.
   * Optional for open kinds, which are graded by the LLM against `rubric`.
   */
  validate?: (input: string) => ExerciseResult;
  /** Grading guidance for LLM-graded "open"/"code-open" exercises. */
  rubric?: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Estimated minutes to complete. */
  minutes: number;
  /** One-line summary shown in sidebars and cards. */
  summary: string;
  Body: React.FC;
  exercises?: Exercise[];
  quiz?: Quiz;
}

export interface Module {
  id: string;
  title: string;
  blurb: string;
  /** Emoji or short glyph shown on the module card. */
  icon: string;
  /** Module ids this one builds on. */
  dependsOn: string[];
  /** Which learning track this module belongs to. Defaults to "engine". */
  track?: TrackId;
  lessons: Lesson[];
}

export type TrackId = "engine" | "dsa" | "math";

export interface Track {
  id: TrackId;
  title: string;
  /** Short tagline shown on the track card / header. */
  blurb: string;
  icon: string;
  /** Accent color for the track (warm industrial palette). */
  accent: string;
}
