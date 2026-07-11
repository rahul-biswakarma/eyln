import type { CodeChallenge } from "./types";

export const challenges: CodeChallenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    source: "Blind 75",
    tags: ["Array", "Hash Map"],
    prompt:
      "Given an array of integers <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up to <code>target</code>. Exactly one solution exists; you may not use the same element twice.",
    fnName: "twoSum",
    starter: `function twoSum(nums, target) {\n  // return [i, j]\n}`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
    ],
    hint: "A hash map of value → index lets you check for target − nums[i] in O(1) as you scan once.",
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  },
  {
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    source: "NeetCode 150",
    tags: ["String", "Hash Map"],
    prompt:
      "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code> (same characters, same counts), else <code>false</code>.",
    fnName: "isAnagram",
    starter: `function isAnagram(s, t) {\n  // return boolean\n}`,
    tests: [
      { args: ["anagram", "nagaram"], expected: true },
      { args: ["rat", "car"], expected: false },
      { args: ["a", "ab"], expected: false },
    ],
    hint: "Count character frequencies for both strings and compare, or sort both and compare.",
    solution: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
  },
  {
    id: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    source: "Blind 75",
    tags: ["Array", "Hash Set"],
    prompt:
      "Return <code>true</code> if any value appears at least twice in <code>nums</code>, and <code>false</code> if every element is distinct.",
    fnName: "containsDuplicate",
    starter: `function containsDuplicate(nums) {\n  // return boolean\n}`,
    tests: [
      { args: [[1, 2, 3, 1]], expected: true },
      { args: [[1, 2, 3, 4]], expected: false },
      { args: [[]], expected: false },
    ],
    hint: "A Set's size vs the array length tells you instantly.",
    solution: `function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}`,
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    source: "Blind 75",
    tags: ["Array", "DP", "Kadane"],
    prompt:
      "Given an integer array <code>nums</code>, find the contiguous subarray with the largest sum and return that sum.",
    fnName: "maxSubArray",
    starter: `function maxSubArray(nums) {\n  // return the max sum\n}`,
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 },
      { args: [[-1, -2, -3]], expected: -1 },
    ],
    hint: "Kadane's algorithm: at each element, either extend the running sum or restart from it. Track the best seen.",
    solution: `function maxSubArray(nums) {
  let best = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    source: "Blind 75",
    tags: ["Stack", "String"],
    prompt:
      "Given a string <code>s</code> of just <code>()[]{}</code>, determine if the brackets are validly opened and closed in order.",
    fnName: "isValid",
    starter: `function isValid(s) {\n  // return boolean\n}`,
    tests: [
      { args: ["()"], expected: true },
      { args: ["()[]{}"], expected: true },
      { args: ["(]"], expected: false },
      { args: ["([)]"], expected: false },
      { args: ["{[]}"], expected: true },
    ],
    hint: "Push opening brackets on a stack; on a closer, the top must be its match.",
    solution: `function isValid(s) {
  const close = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const c of s) {
    if (c in close) {
      if (stack.pop() !== close[c]) return false;
    } else stack.push(c);
  }
  return stack.length === 0;
}`,
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    source: "NeetCode 150",
    tags: ["Binary Search", "Array"],
    prompt:
      "Given a sorted ascending array <code>nums</code> and a <code>target</code>, return its index, or <code>-1</code> if absent. Must run in O(log n).",
    fnName: "search",
    starter: `function search(nums, target) {\n  // return index or -1\n}`,
    tests: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { args: [[5], 5], expected: 0 },
      { args: [[], 1], expected: -1 },
    ],
    hint: "Maintain lo/hi bounds; compare the midpoint and discard half each step.",
    solution: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
  },
  {
    id: "best-time-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    source: "Blind 75",
    tags: ["Array", "Greedy"],
    prompt:
      "Given daily <code>prices</code>, choose one day to buy and a later day to sell for maximum profit. Return the max profit, or <code>0</code> if none is possible.",
    fnName: "maxProfit",
    starter: `function maxProfit(prices) {\n  // return the max profit\n}`,
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { args: [[7, 6, 4, 3, 1]], expected: 0 },
      { args: [[2, 4, 1]], expected: 2 },
    ],
    hint: "Track the minimum price seen so far; the best profit is the largest price − min-so-far.",
    solution: `function maxProfit(prices) {
  let min = Infinity, best = 0;
  for (const p of prices) {
    min = Math.min(min, p);
    best = Math.max(best, p - min);
  }
  return best;
}`,
  },
  {
    id: "reverse-linked-list",
    title: "Reverse a List (array form)",
    difficulty: "Easy",
    source: "Blind 75",
    tags: ["Two Pointers", "Array"],
    prompt:
      "Reverse the array <code>arr</code> in place and return it. (Linked-list reversal, modeled as an array so it runs in the sandbox.)",
    fnName: "reverseList",
    starter: `function reverseList(arr) {\n  // reverse and return arr\n}`,
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expected: [2, 1] },
      { args: [[]], expected: [] },
    ],
    hint: "Swap the two ends and walk the pointers inward.",
    solution: `function reverseList(arr) {
  let i = 0, j = arr.length - 1;
  while (i < j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++; j--;
  }
  return arr;
}`,
  },
  {
    id: "product-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    source: "Blind 75",
    tags: ["Array", "Prefix Product"],
    prompt:
      "Return an array <code>out</code> where <code>out[i]</code> is the product of every element of <code>nums</code> except <code>nums[i]</code>. Do it without division.",
    fnName: "productExceptSelf",
    starter: `function productExceptSelf(nums) {\n  // return the products array\n}`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0] },
    ],
    hint: "Two passes: prefix products left-to-right, then multiply by suffix products right-to-left.",
    solution: `function productExceptSelf(nums) {
  const n = nums.length, out = new Array(n).fill(1);
  let pre = 1;
  for (let i = 0; i < n; i++) { out[i] = pre; pre *= nums[i]; }
  let suf = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= suf; suf *= nums[i]; }
  return out;
}`,
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    source: "NeetCode 150",
    tags: ["DP", "Fibonacci"],
    prompt:
      "You climb <code>n</code> stairs, 1 or 2 steps at a time. Return the number of distinct ways to reach the top.",
    fnName: "climbStairs",
    starter: `function climbStairs(n) {\n  // return the count\n}`,
    tests: [
      { args: [2], expected: 2 },
      { args: [3], expected: 3 },
      { args: [5], expected: 8 },
      { args: [1], expected: 1 },
    ],
    hint: "ways(n) = ways(n−1) + ways(n−2) — it's Fibonacci. Iterate bottom-up.",
    solution: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }
  return a;
}`,
  },
];

export function challengesByDifficulty() {
  const order = { Easy: 0, Medium: 1, Hard: 2 } as const;
  return [...challenges].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
}

export const XP_BY_DIFFICULTY = { Easy: 50, Medium: 100, Hard: 200 } as const;

export const EST_MINUTES = { Easy: 10, Medium: 25, Hard: 45 } as const;

export function xpForChallenge(c: CodeChallenge): number {
  return XP_BY_DIFFICULTY[c.difficulty];
}

export function totalXpEarned(solvedIds: Record<string, number>): number {
  return challenges.reduce((sum, c) => (solvedIds[c.id] ? sum + xpForChallenge(c) : sum), 0);
}
