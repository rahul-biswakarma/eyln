import type { Module } from "../../content/types";
import { mathFunctions } from "../math-functions";
import { mathLimits } from "../math-limits";
import { mathDerivatives } from "../math-derivatives";
import { mathIntegrals } from "../math-integrals";
import { mathCurves } from "../math-curves";
import { mathVectorCalc } from "../math-vector-calc";

/** All Mathematics modules. */
export const mathModules: Module[] = [
  mathFunctions,
  mathLimits,
  mathDerivatives,
  mathIntegrals,
  mathCurves,
  mathVectorCalc,
];
