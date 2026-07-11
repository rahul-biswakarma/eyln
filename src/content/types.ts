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

export type TrackId = "engine" | "dsa" | "math";

export interface Track {
  id: TrackId;
  title: string;
  
  blurb: string;
  icon: string;
  
  accent: string;
}
