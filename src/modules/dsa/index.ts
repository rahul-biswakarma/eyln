import type { Module } from "../../content/types";
import { dsaComplexity } from "../dsa-complexity";
import { dsaArrays } from "../dsa-arrays";
import { dsaHashing } from "../dsa-hashing";
import { dsaLinear } from "../dsa-linear";
import { dsaTrees } from "../dsa-trees";
import { dsaGraphs } from "../dsa-graphs";
import { dsaSorting } from "../dsa-sorting";
import { dsaRecursion } from "../dsa-recursion";

export const dsaModules: Module[] = [
  dsaComplexity,
  dsaArrays,
  dsaHashing,
  dsaLinear,
  dsaTrees,
  dsaGraphs,
  dsaSorting,
  dsaRecursion,
];
