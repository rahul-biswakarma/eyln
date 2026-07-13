import type { CodeChallenge, ChallengeTopic, PracticeTrackId } from "./types";
import { engineChallenges } from "./challenges/engine";
import { mathChallenges } from "./challenges/math";
import { dsaExtraChallenges } from "./challenges/dsa-extra";
const dsaChallenges: CodeChallenge[] = [
    {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        topic: "Arrays",
        source: "Blind 75",
        tags: ["Array", "Hash Map"],
        prompt: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up to <code>target</code>. Exactly one solution exists; you may not use the same element twice.",
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
        id: "max-subarray",
        title: "Maximum Subarray",
        difficulty: "Medium",
        topic: "Arrays",
        source: "Blind 75",
        tags: ["Array", "DP", "Kadane"],
        prompt: "Given an integer array <code>nums</code>, find the contiguous subarray with the largest sum and return that sum.",
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
        id: "best-time-stock",
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        topic: "Arrays",
        source: "Blind 75",
        tags: ["Array", "Greedy"],
        prompt: "Given daily <code>prices</code>, choose one day to buy and a later day to sell for maximum profit. Return the max profit, or <code>0</code> if none is possible.",
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
        id: "product-except-self",
        title: "Product of Array Except Self",
        difficulty: "Medium",
        topic: "Arrays",
        source: "Blind 75",
        tags: ["Array", "Prefix Product"],
        prompt: "Return an array <code>out</code> where <code>out[i]</code> is the product of every element of <code>nums</code> except <code>nums[i]</code>. Do it without division.",
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
        id: "move-zeroes",
        title: "Move Zeroes",
        difficulty: "Easy",
        topic: "Arrays",
        source: "Grind 75",
        tags: ["Array", "Two Pointers"],
        prompt: "Given an integer array <code>nums</code>, move all <code>0</code>s to the end while keeping the relative order of the non-zero elements. Modify in place and return the array.",
        fnName: "moveZeroes",
        starter: `function moveZeroes(nums) {\n  // move zeroes to the end, return nums\n}`,
        tests: [
            { args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
            { args: [[0]], expected: [0] },
            { args: [[1, 2, 3]], expected: [1, 2, 3] },
            { args: [[0, 0, 1]], expected: [1, 0, 0] },
        ],
        hint: "Keep a write pointer for the next non-zero slot; swap each non-zero value into it.",
        solution: `function moveZeroes(nums) {
  let j = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[j], nums[i]] = [nums[i], nums[j]];
      j++;
    }
  }
  return nums;
}`,
    },
    {
        id: "valid-anagram",
        title: "Valid Anagram",
        difficulty: "Easy",
        topic: "Strings",
        source: "NeetCode 150",
        tags: ["String", "Hash Map"],
        prompt: "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code> (same characters, same counts), else <code>false</code>.",
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
        id: "reverse-string",
        title: "Reverse String",
        difficulty: "Easy",
        topic: "Strings",
        source: "Grind 75",
        tags: ["String", "Two Pointers"],
        prompt: "Given an array of characters <code>s</code>, reverse it in place and return it. Use O(1) extra memory.",
        fnName: "reverseString",
        starter: `function reverseString(s) {\n  // reverse the char array, return it\n}`,
        tests: [
            { args: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] },
            { args: [["H", "a", "n", "n", "a", "h"]], expected: ["h", "a", "n", "n", "a", "H"] },
            { args: [["a"]], expected: ["a"] },
        ],
        hint: "Swap the outermost pair and move both pointers inward until they cross.",
        solution: `function reverseString(s) {
  let i = 0, j = s.length - 1;
  while (i < j) {
    [s[i], s[j]] = [s[j], s[i]];
    i++; j--;
  }
  return s;
}`,
    },
    {
        id: "longest-common-prefix",
        title: "Longest Common Prefix",
        difficulty: "Easy",
        topic: "Strings",
        source: "Grind 75",
        tags: ["String"],
        prompt: "Write a function to find the longest common prefix string amongst an array of strings <code>strs</code>. If there is no common prefix, return the empty string.",
        fnName: "longestCommonPrefix",
        starter: `function longestCommonPrefix(strs) {\n  // return the longest common prefix\n}`,
        tests: [
            { args: [["flower", "flow", "flight"]], expected: "fl" },
            { args: [["dog", "racecar", "car"]], expected: "" },
            { args: [["interspecies", "interstellar", "interstate"]], expected: "inters" },
            { args: [["a"]], expected: "a" },
        ],
        hint: "Start with the first word as the candidate prefix and trim it until every word starts with it.",
        solution: `function longestCommonPrefix(strs) {
  if (strs.length === 0) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }
  return prefix;
}`,
    },
    {
        id: "first-unique-char",
        title: "First Unique Character",
        difficulty: "Easy",
        topic: "Strings",
        source: "NeetCode 150",
        tags: ["String", "Hash Map"],
        prompt: "Given a string <code>s</code>, return the index of the first non-repeating character. If none exists, return <code>-1</code>.",
        fnName: "firstUniqChar",
        starter: `function firstUniqChar(s) {\n  // return index or -1\n}`,
        tests: [
            { args: ["leetcode"], expected: 0 },
            { args: ["loveleetcode"], expected: 2 },
            { args: ["aabb"], expected: -1 },
            { args: [""], expected: -1 },
        ],
        hint: "Count every character first, then scan left to right for the first with a count of one.",
        solution: `function firstUniqChar(s) {
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (let i = 0; i < s.length; i++) {
    if (count[s[i]] === 1) return i;
  }
  return -1;
}`,
    },
    {
        id: "contains-duplicate",
        title: "Contains Duplicate",
        difficulty: "Easy",
        topic: "Hashing",
        source: "Blind 75",
        tags: ["Array", "Hash Set"],
        prompt: "Return <code>true</code> if any value appears at least twice in <code>nums</code>, and <code>false</code> if every element is distinct.",
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
        id: "group-anagrams",
        title: "Group Anagrams",
        difficulty: "Medium",
        topic: "Hashing",
        source: "Blind 75",
        tags: ["Hash Map", "String", "Sorting"],
        prompt: "Given an array of strings <code>strs</code>, group the anagrams together. Return the groups with the words in each group sorted, and the groups sorted by their first word.",
        fnName: "groupAnagrams",
        starter: `function groupAnagrams(strs) {\n  // return array of sorted groups\n}`,
        tests: [
            {
                args: [["eat", "tea", "tan", "ate", "nat", "bat"]],
                expected: [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]],
            },
            { args: [[""]], expected: [[""]] },
            { args: [["a"]], expected: [["a"]] },
        ],
        hint: "Use the sorted letters of each word as a hash-map key; then sort within and across the buckets to make output deterministic.",
        solution: `function groupAnagrams(strs) {
  const map = {};
  for (const s of strs) {
    const key = s.split("").sort().join("");
    (map[key] = map[key] || []).push(s);
  }
  return Object.values(map)
    .map((g) => g.sort())
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}`,
    },
    {
        id: "valid-palindrome",
        title: "Valid Palindrome",
        difficulty: "Easy",
        topic: "Two Pointers",
        source: "NeetCode 150",
        tags: ["Two Pointers", "String"],
        prompt: "Given a string <code>s</code>, return <code>true</code> if it reads the same forwards and backwards considering only alphanumeric characters and ignoring case.",
        fnName: "isPalindrome",
        starter: `function isPalindrome(s) {\n  // return boolean\n}`,
        tests: [
            { args: ["A man, a plan, a canal: Panama"], expected: true },
            { args: ["race a car"], expected: false },
            { args: [" "], expected: true },
            { args: ["0P"], expected: false },
        ],
        hint: "Filter to lowercase alphanumerics, then walk two pointers inward comparing characters.",
        solution: `function isPalindrome(s) {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let i = 0, j = t.length - 1;
  while (i < j) {
    if (t[i] !== t[j]) return false;
    i++; j--;
  }
  return true;
}`,
    },
    {
        id: "two-sum-ii-sorted",
        title: "Two Sum II - Sorted Input",
        difficulty: "Medium",
        topic: "Two Pointers",
        source: "NeetCode 150",
        tags: ["Two Pointers", "Array"],
        prompt: "Given a 1-indexed sorted ascending array <code>numbers</code> and a <code>target</code>, return the 1-based indices of the two numbers that add up to <code>target</code>. Exactly one solution exists.",
        fnName: "twoSumII",
        starter: `function twoSumII(numbers, target) {\n  // return [i, j] (1-based)\n}`,
        tests: [
            { args: [[2, 7, 11, 15], 9], expected: [1, 2] },
            { args: [[2, 3, 4], 6], expected: [1, 3] },
            { args: [[-1, 0], -1], expected: [1, 2] },
        ],
        hint: "Because the array is sorted, move a left/right pointer toward each other based on whether the sum is too small or too large.",
        solution: `function twoSumII(numbers, target) {
  let lo = 0, hi = numbers.length - 1;
  while (lo < hi) {
    const sum = numbers[lo] + numbers[hi];
    if (sum === target) return [lo + 1, hi + 1];
    if (sum < target) lo++; else hi--;
  }
  return [];
}`,
    },
    {
        id: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: "Medium",
        topic: "Two Pointers",
        source: "Blind 75",
        tags: ["Two Pointers", "Greedy"],
        prompt: "Given <code>height</code> where each element is a vertical line, find two lines that together with the x-axis hold the most water. Return the maximum area.",
        fnName: "maxArea",
        starter: `function maxArea(height) {\n  // return the max area\n}`,
        tests: [
            { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
            { args: [[1, 1]], expected: 1 },
            { args: [[4, 3, 2, 1, 4]], expected: 16 },
            { args: [[1, 2, 1]], expected: 2 },
        ],
        hint: "Start with the widest pair and move the shorter line inward — the shorter side always limits the area.",
        solution: `function maxArea(height) {
  let lo = 0, hi = height.length - 1, best = 0;
  while (lo < hi) {
    const h = Math.min(height[lo], height[hi]);
    best = Math.max(best, h * (hi - lo));
    if (height[lo] < height[hi]) lo++; else hi--;
  }
  return best;
}`,
    },
    {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "Easy",
        topic: "Stacks & Queues",
        source: "Blind 75",
        tags: ["Stack", "String"],
        prompt: "Given a string <code>s</code> of just <code>()[]{}</code>, determine if the brackets are validly opened and closed in order.",
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
        id: "min-stack",
        title: "Min Stack (op sequence)",
        difficulty: "Medium",
        topic: "Stacks & Queues",
        source: "NeetCode 150",
        tags: ["Stack", "Design"],
        prompt: "Simulate a stack that supports O(1) minimum. You are given <code>ops</code>, an array of operations like <code>[\"push\", 3]</code>, <code>[\"pop\"]</code>, <code>[\"top\"]</code>, <code>[\"getMin\"]</code>. Return an array with the results of each <code>top</code> and <code>getMin</code> query, in order.",
        fnName: "minStack",
        starter: `function minStack(ops) {\n  // return array of query outputs\n}`,
        tests: [
            {
                args: [[["push", -2], ["push", 0], ["push", -3], ["getMin"], ["pop"], ["top"], ["getMin"]]],
                expected: [-3, 0, -2],
            },
            { args: [[["push", 1], ["push", 2], ["top"], ["getMin"]]], expected: [2, 1] },
            { args: [[["push", 5], ["getMin"], ["pop"], ["push", 3], ["getMin"]]], expected: [5, 3] },
        ],
        hint: "Keep a parallel stack of the running minimum so getMin is just the top of that stack.",
        solution: `function minStack(ops) {
  const stack = [];
  const mins = [];
  const out = [];
  for (const op of ops) {
    const cmd = op[0];
    if (cmd === "push") {
      const v = op[1];
      stack.push(v);
      mins.push(mins.length === 0 ? v : Math.min(v, mins[mins.length - 1]));
    } else if (cmd === "pop") {
      stack.pop();
      mins.pop();
    } else if (cmd === "top") {
      out.push(stack[stack.length - 1]);
    } else if (cmd === "getMin") {
      out.push(mins[mins.length - 1]);
    }
  }
  return out;
}`,
    },
    {
        id: "evaluate-rpn",
        title: "Evaluate Reverse Polish Notation",
        difficulty: "Medium",
        topic: "Stacks & Queues",
        source: "NeetCode 150",
        tags: ["Stack", "Math"],
        prompt: "Evaluate the arithmetic expression given in Reverse Polish Notation as a <code>tokens</code> array. Valid operators are <code>+ - * /</code>. Division truncates toward zero.",
        fnName: "evalRPN",
        starter: `function evalRPN(tokens) {\n  // return the integer result\n}`,
        tests: [
            { args: [["2", "1", "+", "3", "*"]], expected: 9 },
            { args: [["4", "13", "5", "/", "+"]], expected: 6 },
            {
                args: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]],
                expected: 22,
            },
        ],
        hint: "Push numbers on a stack; on an operator pop the top two operands, apply it, and push the result back.",
        solution: `function evalRPN(tokens) {
  const stack = [];
  const ops = new Set(["+", "-", "*", "/"]);
  for (const t of tokens) {
    if (ops.has(t)) {
      const b = stack.pop();
      const a = stack.pop();
      let r;
      if (t === "+") r = a + b;
      else if (t === "-") r = a - b;
      else if (t === "*") r = a * b;
      else r = Math.trunc(a / b);
      stack.push(r);
    } else {
      stack.push(Number(t));
    }
  }
  return stack[0];
}`,
    },
    {
        id: "reverse-linked-list",
        title: "Reverse a List (array form)",
        difficulty: "Easy",
        topic: "Linked Lists",
        source: "Blind 75",
        tags: ["Two Pointers", "Array"],
        prompt: "Reverse the array <code>arr</code> in place and return it. (Linked-list reversal, modeled as an array so it runs in the sandbox.)",
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
        id: "merge-two-lists",
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        topic: "Linked Lists",
        source: "Blind 75",
        tags: ["Linked List", "Two Pointers"],
        prompt: "Merge two ascending-sorted lists <code>l1</code> and <code>l2</code> (given as arrays) into one sorted array and return it.",
        fnName: "mergeTwoLists",
        starter: `function mergeTwoLists(l1, l2) {\n  // return merged sorted array\n}`,
        tests: [
            { args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
            { args: [[], []], expected: [] },
            { args: [[], [0]], expected: [0] },
            { args: [[1, 5, 7], [2, 3]], expected: [1, 2, 3, 5, 7] },
        ],
        hint: "Walk both arrays with two indices, always taking the smaller current head, then append the leftovers.",
        solution: `function mergeTwoLists(l1, l2) {
  const out = [];
  let i = 0, j = 0;
  while (i < l1.length && j < l2.length) {
    if (l1[i] <= l2[j]) out.push(l1[i++]);
    else out.push(l2[j++]);
  }
  while (i < l1.length) out.push(l1[i++]);
  while (j < l2.length) out.push(l2[j++]);
  return out;
}`,
    },
    {
        id: "middle-of-list",
        title: "Middle of the Linked List",
        difficulty: "Easy",
        topic: "Linked Lists",
        source: "Grind 75",
        tags: ["Linked List", "Two Pointers"],
        prompt: "Given a list modeled as the array <code>arr</code>, return the value of the middle node. If there are two middle nodes, return the second one.",
        fnName: "middleNode",
        starter: `function middleNode(arr) {\n  // return the middle value\n}`,
        tests: [
            { args: [[1, 2, 3, 4, 5]], expected: 3 },
            { args: [[1, 2, 3, 4, 5, 6]], expected: 4 },
            { args: [[1]], expected: 1 },
        ],
        hint: "Advance a slow pointer one step and a fast pointer two steps; when fast reaches the end, slow is at the middle.",
        solution: `function middleNode(arr) {
  let slow = 0, fast = 0;
  while (fast < arr.length && fast + 1 < arr.length) {
    slow++; fast += 2;
  }
  return arr[slow];
}`,
    },
    {
        id: "max-depth-binary-tree",
        title: "Maximum Depth of Binary Tree",
        difficulty: "Easy",
        topic: "Trees",
        source: "Blind 75",
        tags: ["Tree", "DFS", "Recursion"],
        prompt: "Given a binary tree as a level-order array <code>arr</code> (using <code>null</code> for missing nodes), return its maximum depth — the number of nodes along the longest root-to-leaf path.",
        fnName: "maxDepth",
        starter: `function maxDepth(arr) {\n  // return the depth\n}`,
        tests: [
            { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
            { args: [[1, null, 2]], expected: 2 },
            { args: [[]], expected: 0 },
            { args: [[0]], expected: 1 },
        ],
        hint: "Rebuild the tree from the level-order array, then recurse: depth = 1 + max(depth(left), depth(right)).",
        solution: `function maxDepth(arr) {
  function build(a) {
    if (a.length === 0 || a[0] === null) return null;
    const root = { val: a[0], left: null, right: null };
    const queue = [root];
    let i = 1;
    while (queue.length && i < a.length) {
      const node = queue.shift();
      if (i < a.length) {
        const l = a[i++];
        if (l !== null) { node.left = { val: l, left: null, right: null }; queue.push(node.left); }
      }
      if (i < a.length) {
        const r = a[i++];
        if (r !== null) { node.right = { val: r, left: null, right: null }; queue.push(node.right); }
      }
    }
    return root;
  }
  function depth(n) { return n ? 1 + Math.max(depth(n.left), depth(n.right)) : 0; }
  return depth(build(arr));
}`,
    },
    {
        id: "invert-tree",
        title: "Invert Binary Tree",
        difficulty: "Easy",
        topic: "Trees",
        source: "Blind 75",
        tags: ["Tree", "DFS", "Recursion"],
        prompt: "Given a binary tree as a level-order array <code>arr</code>, invert it (mirror left/right at every node) and return the inverted tree as a level-order array.",
        fnName: "invertTree",
        starter: `function invertTree(arr) {\n  // return inverted level-order array\n}`,
        tests: [
            { args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
            { args: [[2, 1, 3]], expected: [2, 3, 1] },
            { args: [[]], expected: [] },
        ],
        hint: "Build the tree, swap each node's children recursively, then serialize back level by level.",
        solution: `function invertTree(arr) {
  function build(a) {
    if (a.length === 0 || a[0] === null) return null;
    const root = { val: a[0], left: null, right: null };
    const queue = [root];
    let i = 1;
    while (queue.length && i < a.length) {
      const node = queue.shift();
      if (i < a.length) {
        const l = a[i++];
        if (l !== null) { node.left = { val: l, left: null, right: null }; queue.push(node.left); }
      }
      if (i < a.length) {
        const r = a[i++];
        if (r !== null) { node.right = { val: r, left: null, right: null }; queue.push(node.right); }
      }
    }
    return root;
  }
  function invert(n) {
    if (!n) return null;
    [n.left, n.right] = [invert(n.right), invert(n.left)];
    return n;
  }
  function serialize(root) {
    if (!root) return [];
    const out = [];
    const queue = [root];
    while (queue.length) {
      const node = queue.shift();
      if (node) {
        out.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        out.push(null);
      }
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  }
  return serialize(invert(build(arr)));
}`,
    },
    {
        id: "same-tree",
        title: "Same Tree",
        difficulty: "Easy",
        topic: "Trees",
        source: "NeetCode 150",
        tags: ["Tree", "DFS", "Recursion"],
        prompt: "Given two binary trees as level-order arrays <code>p</code> and <code>q</code>, return <code>true</code> if they are structurally identical with the same node values.",
        fnName: "isSameTree",
        starter: `function isSameTree(p, q) {\n  // return boolean\n}`,
        tests: [
            { args: [[1, 2, 3], [1, 2, 3]], expected: true },
            { args: [[1, 2], [1, null, 2]], expected: false },
            { args: [[1, 2, 1], [1, 1, 2]], expected: false },
            { args: [[], []], expected: true },
        ],
        hint: "Rebuild both trees and recurse in lockstep: same if both null, or values match and both subtrees match.",
        solution: `function isSameTree(p, q) {
  function build(a) {
    if (a.length === 0 || a[0] === null) return null;
    const root = { val: a[0], left: null, right: null };
    const queue = [root];
    let i = 1;
    while (queue.length && i < a.length) {
      const node = queue.shift();
      if (i < a.length) {
        const l = a[i++];
        if (l !== null) { node.left = { val: l, left: null, right: null }; queue.push(node.left); }
      }
      if (i < a.length) {
        const r = a[i++];
        if (r !== null) { node.right = { val: r, left: null, right: null }; queue.push(node.right); }
      }
    }
    return root;
  }
  function same(a, b) {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return same(a.left, b.left) && same(a.right, b.right);
  }
  return same(build(p), build(q));
}`,
    },
    {
        id: "bubble-sort",
        title: "Bubble Sort",
        difficulty: "Easy",
        topic: "Sorting",
        tags: ["Sorting", "Array"],
        prompt: "Implement bubble sort. Return a new array with the elements of <code>arr</code> in ascending order.",
        fnName: "bubbleSort",
        starter: `function bubbleSort(arr) {\n  // return sorted array\n}`,
        tests: [
            { args: [[5, 2, 9, 1, 5, 6]], expected: [1, 2, 5, 5, 6, 9] },
            { args: [[]], expected: [] },
            { args: [[3, 1, 2]], expected: [1, 2, 3] },
            { args: [[1]], expected: [1] },
        ],
        hint: "Repeatedly sweep the array, swapping adjacent out-of-order pairs; the largest bubbles to the end each pass.",
        solution: `function bubbleSort(arr) {
  const a = arr.slice();
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  return a;
}`,
    },
    {
        id: "merge-sort",
        title: "Merge Sort",
        difficulty: "Medium",
        topic: "Sorting",
        tags: ["Sorting", "Divide & Conquer", "Recursion"],
        prompt: "Implement merge sort. Return a new array with the elements of <code>arr</code> in ascending order.",
        fnName: "mergeSort",
        starter: `function mergeSort(arr) {\n  // return sorted array\n}`,
        tests: [
            { args: [[5, 2, 9, 1, 5, 6]], expected: [1, 2, 5, 5, 6, 9] },
            { args: [[-3, 0, -1, 2]], expected: [-3, -1, 0, 2] },
            { args: [[]], expected: [] },
            { args: [[2, 1]], expected: [1, 2] },
        ],
        hint: "Split the array in half, sort each half recursively, then merge the two sorted halves.",
        solution: `function mergeSort(arr) {
  if (arr.length <= 1) return arr.slice();
  const mid = arr.length >> 1;
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}`,
    },
    {
        id: "insertion-sort",
        title: "Insertion Sort",
        difficulty: "Easy",
        topic: "Sorting",
        tags: ["Sorting", "Array"],
        prompt: "Implement insertion sort. Return a new array with the elements of <code>arr</code> in ascending order.",
        fnName: "insertionSort",
        starter: `function insertionSort(arr) {\n  // return sorted array\n}`,
        tests: [
            { args: [[5, 2, 9, 1, 5, 6]], expected: [1, 2, 5, 5, 6, 9] },
            { args: [[4, 3, 2, 1]], expected: [1, 2, 3, 4] },
            { args: [[1]], expected: [1] },
            { args: [[]], expected: [] },
        ],
        hint: "Grow a sorted prefix: take each next element and shift larger sorted elements right until it slots in.",
        solution: `function insertionSort(arr) {
  const a = arr.slice();
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
    a[j + 1] = key;
  }
  return a;
}`,
    },
    {
        id: "binary-search",
        title: "Binary Search",
        difficulty: "Easy",
        topic: "Searching",
        source: "NeetCode 150",
        tags: ["Binary Search", "Array"],
        prompt: "Given a sorted ascending array <code>nums</code> and a <code>target</code>, return its index, or <code>-1</code> if absent. Must run in O(log n).",
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
        id: "search-insert-position",
        title: "Search Insert Position",
        difficulty: "Easy",
        topic: "Searching",
        source: "Grind 75",
        tags: ["Binary Search", "Array"],
        prompt: "Given a sorted array <code>nums</code> of distinct integers and a <code>target</code>, return the index if found, otherwise the index where it would be inserted to keep the array sorted.",
        fnName: "searchInsert",
        starter: `function searchInsert(nums, target) {\n  // return the index\n}`,
        tests: [
            { args: [[1, 3, 5, 6], 5], expected: 2 },
            { args: [[1, 3, 5, 6], 2], expected: 1 },
            { args: [[1, 3, 5, 6], 7], expected: 4 },
            { args: [[1, 3, 5, 6], 0], expected: 0 },
        ],
        hint: "Binary search for the first index whose value is not less than the target.",
        solution: `function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
    },
    {
        id: "search-rotated",
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        topic: "Searching",
        source: "Blind 75",
        tags: ["Binary Search", "Array"],
        prompt: "An ascending array <code>nums</code> of distinct values is rotated at an unknown pivot. Given a <code>target</code>, return its index or <code>-1</code>. Must run in O(log n).",
        fnName: "searchRotated",
        starter: `function searchRotated(nums, target) {\n  // return index or -1\n}`,
        tests: [
            { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
            { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
            { args: [[1], 0], expected: -1 },
            { args: [[5, 1, 3], 5], expected: 0 },
        ],
        hint: "At each midpoint one half is sorted; decide which half holds the target by comparing endpoints.",
        solution: `function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
    },
    {
        id: "climbing-stairs",
        title: "Climbing Stairs",
        difficulty: "Easy",
        topic: "Recursion & DP",
        source: "NeetCode 150",
        tags: ["DP", "Fibonacci"],
        prompt: "You climb <code>n</code> stairs, 1 or 2 steps at a time. Return the number of distinct ways to reach the top.",
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
    {
        id: "fibonacci",
        title: "Fibonacci Number",
        difficulty: "Easy",
        topic: "Recursion & DP",
        source: "Grind 75",
        tags: ["DP", "Recursion", "Math"],
        prompt: "Return the <code>n</code>-th Fibonacci number, where <code>F(0) = 0</code>, <code>F(1) = 1</code>, and <code>F(n) = F(n−1) + F(n−2)</code>.",
        fnName: "fib",
        starter: `function fib(n) {\n  // return F(n)\n}`,
        tests: [
            { args: [0], expected: 0 },
            { args: [1], expected: 1 },
            { args: [10], expected: 55 },
            { args: [15], expected: 610 },
        ],
        hint: "Iterate from the bottom keeping only the last two values to avoid exponential recursion.",
        solution: `function fib(n) {
  if (n < 2) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) { [a, b] = [b, a + b]; }
  return b;
}`,
    },
    {
        id: "house-robber",
        title: "House Robber",
        difficulty: "Medium",
        topic: "Recursion & DP",
        source: "Blind 75",
        tags: ["DP", "Array"],
        prompt: "Given <code>nums</code> where each element is the money in a house, return the maximum you can rob without robbing two adjacent houses.",
        fnName: "rob",
        starter: `function rob(nums) {\n  // return the max total\n}`,
        tests: [
            { args: [[1, 2, 3, 1]], expected: 4 },
            { args: [[2, 7, 9, 3, 1]], expected: 12 },
            { args: [[]], expected: 0 },
            { args: [[5]], expected: 5 },
        ],
        hint: "At each house choose the better of skipping it (carry previous best) or robbing it (best from two houses back plus its value).",
        solution: `function rob(nums) {
  let prev = 0, cur = 0;
  for (const n of nums) {
    const t = Math.max(cur, prev + n);
    prev = cur;
    cur = t;
  }
  return cur;
}`,
    },
    {
        id: "coin-change",
        title: "Coin Change",
        difficulty: "Medium",
        topic: "Recursion & DP",
        source: "Blind 75",
        tags: ["DP", "Array"],
        prompt: "Given coin denominations <code>coins</code> and an <code>amount</code>, return the fewest coins needed to make that amount, or <code>-1</code> if it cannot be made.",
        fnName: "coinChange",
        starter: `function coinChange(coins, amount) {\n  // return fewest coins or -1\n}`,
        tests: [
            { args: [[1, 2, 5], 11], expected: 3 },
            { args: [[2], 3], expected: -1 },
            { args: [[1], 0], expected: 0 },
            { args: [[2, 5, 10, 1], 27], expected: 4 },
        ],
        hint: "Bottom-up DP: dp[a] is the min coins for amount a, built from dp[a − coin] + 1 over all coins.",
        solution: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    },
    {
        id: "fizzbuzz",
        title: "Fizz Buzz",
        difficulty: "Easy",
        topic: "Math",
        tags: ["Math", "String"],
        prompt: "Return an array of strings for the numbers <code>1</code> to <code>n</code>: <code>\"Fizz\"</code> for multiples of 3, <code>\"Buzz\"</code> for multiples of 5, <code>\"FizzBuzz\"</code> for multiples of both, else the number as a string.",
        fnName: "fizzBuzz",
        starter: `function fizzBuzz(n) {\n  // return array of strings\n}`,
        tests: [
            { args: [3], expected: ["1", "2", "Fizz"] },
            { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
            {
                args: [15],
                expected: [
                    "1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz",
                    "11", "Fizz", "13", "14", "FizzBuzz",
                ],
            },
        ],
        hint: "Check divisibility by 15 first, then 3, then 5, and default to the number itself.",
        solution: `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push("FizzBuzz");
    else if (i % 3 === 0) out.push("Fizz");
    else if (i % 5 === 0) out.push("Buzz");
    else out.push(String(i));
  }
  return out;
}`,
    },
    {
        id: "gcd",
        title: "Greatest Common Divisor",
        difficulty: "Easy",
        topic: "Math",
        tags: ["Math", "Euclid"],
        prompt: "Return the greatest common divisor of two non-negative integers <code>a</code> and <code>b</code>.",
        fnName: "gcd",
        starter: `function gcd(a, b) {\n  // return the GCD\n}`,
        tests: [
            { args: [12, 8], expected: 4 },
            { args: [54, 24], expected: 6 },
            { args: [7, 13], expected: 1 },
            { args: [0, 5], expected: 5 },
        ],
        hint: "Euclid's algorithm: gcd(a, b) = gcd(b, a mod b) until the remainder is zero.",
        solution: `function gcd(a, b) {
  while (b !== 0) { [a, b] = [b, a % b]; }
  return a;
}`,
    },
    {
        id: "power-of-two",
        title: "Power of Two",
        difficulty: "Easy",
        topic: "Math",
        source: "Grind 75",
        tags: ["Math", "Bit Manipulation"],
        prompt: "Given an integer <code>n</code>, return <code>true</code> if it is a power of two (i.e. <code>n = 2^k</code> for some integer <code>k ≥ 0</code>).",
        fnName: "isPowerOfTwo",
        starter: `function isPowerOfTwo(n) {\n  // return boolean\n}`,
        tests: [
            { args: [1], expected: true },
            { args: [16], expected: true },
            { args: [3], expected: false },
            { args: [0], expected: false },
        ],
        hint: "A positive power of two has exactly one set bit, so n & (n − 1) clears it to zero.",
        solution: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}`,
    },
];
const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 } as const;
function byDifficulty(a: CodeChallenge, b: CodeChallenge) {
    return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
}
export const challenges: CodeChallenge[] = [
    ...dsaChallenges.map((c) => ({ ...c, practiceTrack: "dsa" as PracticeTrackId })),
    ...dsaExtraChallenges,
    ...engineChallenges,
    ...mathChallenges,
];
export function challengesByDifficulty() {
    return [...challenges].sort(byDifficulty);
}
export const XP_BY_DIFFICULTY = { Easy: 50, Medium: 100, Hard: 200 } as const;
export const EST_MINUTES = { Easy: 10, Medium: 25, Hard: 45 } as const;
export function xpForChallenge(c: CodeChallenge): number {
    return XP_BY_DIFFICULTY[c.difficulty];
}
export function totalXpEarned(solvedIds: Record<string, number>): number {
    return challenges.reduce((s, c) => (solvedIds[c.id] ? s + xpForChallenge(c) : s), 0);
}
export interface PracticeTrack {
    id: PracticeTrackId;
    title: string;
    blurb: string;
}
export const PRACTICE_TRACKS: PracticeTrack[] = [
    { id: "dsa", title: "Data Structures & Algorithms", blurb: "Blind 75 / NeetCode — the interview canon." },
    { id: "engine", title: "3D Engine Math", blurb: "Vectors, matrices, and the geometry your renderer runs on." },
    { id: "math", title: "Mathematics", blurb: "Numeric calculus, sequences, and applied math." },
];
export function trackOf(c: CodeChallenge): PracticeTrackId {
    return c.practiceTrack ?? "dsa";
}
function keyTokens(label: string): string[] {
    const stop = new Set(["and", "the", "for", "with", "big", "amp"]);
    return label
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2 && !stop.has(w));
}
export function challengesForModule(track: PracticeTrackId, moduleTitle: string): CodeChallenge[] {
    const want = new Set(keyTokens(moduleTitle));
    if (want.size === 0)
        return [];
    return challengesForTrack(track)
        .filter((c) => keyTokens(c.topic).some((t) => want.has(t)))
        .sort((a, b) => XP_BY_DIFFICULTY[b.difficulty] - XP_BY_DIFFICULTY[a.difficulty]);
}
export function challengesForTrack(track: PracticeTrackId): CodeChallenge[] {
    return challenges.filter((c) => trackOf(c) === track);
}
export function topicsForTrack(track: PracticeTrackId): string[] {
    const seen: string[] = [];
    for (const c of challengesForTrack(track))
        if (!seen.includes(c.topic))
            seen.push(c.topic);
    return seen;
}
export function challengesByTopic(track: PracticeTrackId = "dsa"): {
    topic: ChallengeTopic;
    items: CodeChallenge[];
}[] {
    return topicsForTrack(track).map((topic) => ({
        topic,
        items: challengesForTrack(track).filter((c) => c.topic === topic).sort(byDifficulty),
    }));
}
