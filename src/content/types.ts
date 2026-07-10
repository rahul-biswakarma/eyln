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

export type ExerciseKind = "wgsl" | "ts" | "predict" | "numeric";

export interface ExerciseResult {
  pass: boolean;
  message: string;
}

export interface Exercise {
  id: string;
  prompt: string;
  kind: ExerciseKind;
  starter: string;
  /** For "predict"/"numeric": the validator gets the user's raw input. */
  validate: (input: string) => ExerciseResult;
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
  lessons: Lesson[];
}
