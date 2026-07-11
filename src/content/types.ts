import type React from "react";

export interface QuizQuestion {
  q: string;
  
  choices?: string[];
  
  answer: number;
  
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
  
  feedback?: string;
}

export interface Exercise {
  id: string;
  prompt: string;
  kind: ExerciseKind;
  starter: string;
  
  validate?: (input: string) => ExerciseResult;
  
  rubric?: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  
  minutes: number;
  
  summary: string;
  Body: React.FC;
  exercises?: Exercise[];
  quiz?: Quiz;
}

export interface Module {
  id: string;
  title: string;
  blurb: string;
  
  icon: string;
  
  dependsOn: string[];
  
  track?: TrackId;
  lessons: Lesson[];
}

export interface TestCase {
  /** Args passed to the solution function, in order. */
  args: unknown[];
  /** Expected return value (deep-equality compared). */
  expected: unknown;
}

export interface CodeChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Source sheet / origin, e.g. "Blind 75". */
  source?: string;
  tags: string[];
  /** Problem statement (may contain simple HTML via the renderer). */
  prompt: string;
  /** The function the user must implement (must be a global fn of this name). */
  fnName: string;
  /** Starter code seeded into the editor. */
  starter: string;
  tests: TestCase[];
  hint?: string;
  /** A known-good reference solution, revealable after solving/among hints. */
  solution?: string;
}

export type TrackId = "engine" | "dsa" | "math";

export interface Track {
  id: TrackId;
  title: string;
  
  blurb: string;
  icon: string;
  
  accent: string;
}
