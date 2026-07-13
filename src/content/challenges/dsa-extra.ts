import type { CodeChallenge } from "../types";
export const dsaExtraChallenges: CodeChallenge[] = [
    {
        id: "running-sum",
        title: "Running Sum of 1D Array",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Arrays",
        source: "LeetCode",
        tags: ["Array", "Prefix Sum"],
        prompt: "Given an array <code>nums</code>, return its running sum where <code>out[i] = nums[0] + nums[1] + ... + nums[i]</code>.",
        fnName: "runningSum",
        starter: `function runningSum(nums) {\n  // return the running-sum array\n}`,
        tests: [
            { args: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] },
            { args: [[1, 1, 1, 1, 1]], expected: [1, 2, 3, 4, 5] },
            { args: [[3, -2, 5]], expected: [3, 1, 6] },
            { args: [[]], expected: [] },
        ],
        hint: "Keep a running total and push it into the output as you scan left to right.",
        solution: `function runningSum(nums) {
  const out = [];
  let sum = 0;
  for (const n of nums) {
    sum += n;
    out.push(sum);
  }
  return out;
}`,
    },
    {
        id: "majority-element",
        title: "Majority Element",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Arrays",
        source: "LeetCode",
        tags: ["Array", "Boyer-Moore"],
        prompt: "Given an array <code>nums</code> of size <code>n</code>, return the majority element — the value that appears more than <code>&lfloor;n/2&rfloor;</code> times. A majority element always exists.",
        fnName: "majorityElement",
        starter: `function majorityElement(nums) {\n  // return the majority value\n}`,
        tests: [
            { args: [[3, 2, 3]], expected: 3 },
            { args: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 },
            { args: [[1]], expected: 1 },
        ],
        hint: "Boyer-Moore voting: keep a candidate and a count; increment when it matches, decrement otherwise, and reset the candidate when the count hits 0.",
        solution: `function majorityElement(nums) {
  let count = 0, cand = null;
  for (const n of nums) {
    if (count === 0) cand = n;
    count += n === cand ? 1 : -1;
  }
  return cand;
}`,
    },
    {
        id: "rotate-array-by-k",
        title: "Rotate Array by K",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Arrays",
        source: "LeetCode",
        tags: ["Array", "Rotation"],
        prompt: "Rotate array <code>nums</code> to the right by <code>k</code> steps and return the rotated array. <code>k</code> may be larger than the array length.",
        fnName: "rotate",
        starter: `function rotate(nums, k) {\n  // return the rotated array\n}`,
        tests: [
            { args: [[1, 2, 3, 4, 5, 6, 7], 3], expected: [5, 6, 7, 1, 2, 3, 4] },
            { args: [[-1, -100, 3, 99], 2], expected: [3, 99, -1, -100] },
            { args: [[1, 2], 0], expected: [1, 2] },
        ],
        hint: "Take k modulo the length first. The last k elements move to the front; concatenate them before the rest.",
        solution: `function rotate(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  k %= n;
  return nums.slice(n - k).concat(nums.slice(0, n - k));
}`,
    },
    {
        id: "count-vowels",
        title: "Count Vowels",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Strings",
        source: "Classic",
        tags: ["String"],
        prompt: "Return the number of vowels (<code>a, e, i, o, u</code>, case-insensitive) in the string <code>s</code>.",
        fnName: "countVowels",
        starter: `function countVowels(s) {\n  // return the vowel count\n}`,
        tests: [
            { args: ["hello world"], expected: 3 },
            { args: ["AEIOU"], expected: 5 },
            { args: ["xyz"], expected: 0 },
            { args: [""], expected: 0 },
        ],
        hint: "Lowercase each character and check membership in the set of vowels.",
        solution: `function countVowels(s) {
  let count = 0;
  for (const ch of s.toLowerCase()) {
    if ("aeiou".includes(ch)) count++;
  }
  return count;
}`,
    },
    {
        id: "reverse-words",
        title: "Reverse Words in a String",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Strings",
        source: "LeetCode",
        tags: ["String", "Parsing"],
        prompt: "Given a string <code>s</code>, reverse the order of the words. A word is a sequence of non-space characters. Collapse multiple spaces and trim leading/trailing spaces, returning words separated by a single space.",
        fnName: "reverseWords",
        starter: `function reverseWords(s) {\n  // return the reversed-words string\n}`,
        tests: [
            { args: ["the sky is blue"], expected: "blue is sky the" },
            { args: ["  hello   world  "], expected: "world hello" },
            { args: ["single"], expected: "single" },
        ],
        hint: "Trim, split on runs of whitespace, reverse the resulting array, and join with a single space.",
        solution: `function reverseWords(s) {
  return s.trim().split(/\\s+/).reverse().join(" ");
}`,
    },
    {
        id: "roman-to-int",
        title: "Roman to Integer",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Strings",
        source: "LeetCode",
        tags: ["String", "Hash Map"],
        prompt: "Convert a Roman numeral string <code>s</code> to an integer. When a smaller symbol appears before a larger one (e.g. <code>IV</code>, <code>IX</code>), it is subtracted.",
        fnName: "romanToInt",
        starter: `function romanToInt(s) {\n  // return the integer value\n}`,
        tests: [
            { args: ["III"], expected: 3 },
            { args: ["LVIII"], expected: 58 },
            { args: ["MCMXCIV"], expected: 1994 },
        ],
        hint: "Map each symbol to its value. Add it, but subtract instead when the next symbol is larger.",
        solution: `function romanToInt(s) {
  const m = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = m[s[i]];
    if (i + 1 < s.length && m[s[i + 1]] > v) total -= v;
    else total += v;
  }
  return total;
}`,
    },
    {
        id: "intersection-of-arrays",
        title: "Intersection of Two Arrays",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Hashing",
        source: "LeetCode",
        tags: ["Hash Set", "Array"],
        prompt: "Given two integer arrays <code>a</code> and <code>b</code>, return their intersection: each common element appears once. Return the values in ascending order.",
        fnName: "intersection",
        starter: `function intersection(a, b) {\n  // return the sorted unique intersection\n}`,
        tests: [
            { args: [[4, 9, 5], [9, 4, 9, 8, 4]], expected: [4, 9] },
            { args: [[1, 2, 2, 1], [2, 2]], expected: [2] },
            { args: [[1, 2, 3], [4, 5]], expected: [] },
        ],
        hint: "Put b into a Set, collect elements of a that are present, dedupe, then sort ascending.",
        solution: `function intersection(a, b) {
  const setB = new Set(b);
  const out = new Set();
  for (const x of a) if (setB.has(x)) out.add(x);
  return [...out].sort((p, q) => p - q);
}`,
    },
    {
        id: "happy-number",
        title: "Happy Number",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Hashing",
        source: "LeetCode",
        tags: ["Hash Set", "Math", "Cycle Detection"],
        prompt: "A number is happy if repeatedly replacing it with the sum of the squares of its digits eventually reaches <code>1</code>. Return <code>true</code> if <code>n</code> is happy, otherwise <code>false</code> (it loops forever).",
        fnName: "isHappy",
        starter: `function isHappy(n) {\n  // return true if n is a happy number\n}`,
        tests: [
            { args: [19], expected: true },
            { args: [2], expected: false },
            { args: [1], expected: true },
        ],
        hint: "Track seen numbers in a Set. If you revisit one before reaching 1, you are in a cycle.",
        solution: `function isHappy(n) {
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    let s = 0;
    while (n > 0) {
      const d = n % 10;
      s += d * d;
      n = Math.floor(n / 10);
    }
    n = s;
  }
  return n === 1;
}`,
    },
    {
        id: "longest-consecutive-sequence",
        title: "Longest Consecutive Sequence",
        difficulty: "Hard",
        practiceTrack: "dsa",
        topic: "Hashing",
        source: "Blind 75",
        tags: ["Hash Set", "Array"],
        prompt: "Given an unsorted array <code>nums</code>, return the length of the longest run of consecutive integers. Aim for O(n) using a hash set.",
        fnName: "longestConsecutive",
        starter: `function longestConsecutive(nums) {\n  // return the longest streak length\n}`,
        tests: [
            { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
            { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
            { args: [[]], expected: 0 },
        ],
        hint: "Build a set. Only start counting from a value x when x-1 is absent (a sequence start), then walk upward.",
        solution: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (!set.has(x - 1)) {
      let cur = x, len = 1;
      while (set.has(cur + 1)) { cur++; len++; }
      best = Math.max(best, len);
    }
  }
  return best;
}`,
    },
    {
        id: "remove-duplicates-sorted",
        title: "Remove Duplicates from Sorted Array",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Two Pointers",
        source: "LeetCode",
        tags: ["Two Pointers", "Array"],
        prompt: "Given a sorted array <code>nums</code>, remove the duplicates so each value appears once. Return the resulting array of unique values in order.",
        fnName: "removeDuplicates",
        starter: `function removeDuplicates(nums) {\n  // return the deduped array\n}`,
        tests: [
            { args: [[1, 1, 2]], expected: [1, 2] },
            { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [0, 1, 2, 3, 4] },
            { args: [[]], expected: [] },
        ],
        hint: "Push a value only when it differs from the last value already kept.",
        solution: `function removeDuplicates(nums) {
  const out = [];
  for (const x of nums) {
    if (out.length === 0 || out[out.length - 1] !== x) out.push(x);
  }
  return out;
}`,
    },
    {
        id: "sort-colors",
        title: "Sort Colors",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Two Pointers",
        source: "LeetCode",
        tags: ["Two Pointers", "Dutch Flag"],
        prompt: "Given an array <code>nums</code> containing only <code>0</code>, <code>1</code>, and <code>2</code>, sort it in place (Dutch National Flag) and return it. Do it in one pass without a library sort.",
        fnName: "sortColors",
        starter: `function sortColors(nums) {\n  // return nums sorted in place\n}`,
        tests: [
            { args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
            { args: [[2, 0, 1]], expected: [0, 1, 2] },
            { args: [[0]], expected: [0] },
        ],
        hint: "Three pointers: lo, mid, hi. Swap 0s to the front, 2s to the back, and advance mid over the 1s.",
        solution: `function sortColors(nums) {
  let lo = 0, mid = 0, hi = nums.length - 1;
  while (mid <= hi) {
    if (nums[mid] === 0) {
      [nums[lo], nums[mid]] = [nums[mid], nums[lo]];
      lo++; mid++;
    } else if (nums[mid] === 2) {
      [nums[mid], nums[hi]] = [nums[hi], nums[mid]];
      hi--;
    } else {
      mid++;
    }
  }
  return nums;
}`,
    },
    {
        id: "three-sum",
        title: "3Sum",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Two Pointers",
        source: "Blind 75",
        tags: ["Two Pointers", "Array"],
        prompt: "Given an array <code>nums</code>, return all unique triples <code>[a, b, c]</code> that sum to zero. Sort each triple ascending, and return the list of triples sorted by their first then second element. No duplicate triples.",
        fnName: "threeSum",
        starter: `function threeSum(nums) {\n  // return the array of triples\n}`,
        tests: [
            { args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] },
            { args: [[0, 1, 1]], expected: [] },
            { args: [[0, 0, 0]], expected: [[0, 0, 0]] },
        ],
        hint: "Sort the array. Fix each i, then use two pointers l/r inward. Skip equal values to avoid duplicate triples.",
        solution: `function threeSum(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const res = [];
  for (let i = 0; i < a.length - 2; i++) {
    if (i > 0 && a[i] === a[i - 1]) continue;
    let l = i + 1, r = a.length - 1;
    while (l < r) {
      const s = a[i] + a[l] + a[r];
      if (s < 0) l++;
      else if (s > 0) r--;
      else {
        res.push([a[i], a[l], a[r]]);
        while (l < r && a[l] === a[l + 1]) l++;
        while (l < r && a[r] === a[r - 1]) r--;
        l++; r--;
      }
    }
  }
  return res;
}`,
    },
    {
        id: "trapping-rain-water",
        title: "Trapping Rain Water",
        difficulty: "Hard",
        practiceTrack: "dsa",
        topic: "Two Pointers",
        source: "Blind 75",
        tags: ["Two Pointers", "Array"],
        prompt: "Given non-negative heights <code>h</code> representing an elevation map where each bar has width 1, return how much rain water it can trap.",
        fnName: "trap",
        starter: `function trap(h) {\n  // return trapped water volume\n}`,
        tests: [
            { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
            { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
            { args: [[1, 2, 3]], expected: 0 },
        ],
        hint: "Two pointers with running left-max and right-max. Move the side with the smaller wall; water above a bar is (max so far on that side − its height).",
        solution: `function trap(h) {
  let l = 0, r = h.length - 1, lm = 0, rm = 0, water = 0;
  while (l < r) {
    if (h[l] < h[r]) {
      lm = Math.max(lm, h[l]);
      water += lm - h[l];
      l++;
    } else {
      rm = Math.max(rm, h[r]);
      water += rm - h[r];
      r--;
    }
  }
  return water;
}`,
    },
    {
        id: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Stacks & Queues",
        source: "LeetCode",
        tags: ["Stack", "Monotonic Stack"],
        prompt: "Given daily temperatures <code>t</code>, return an array where <code>out[i]</code> is the number of days you must wait after day <code>i</code> for a warmer temperature. If none exists, use <code>0</code>.",
        fnName: "dailyTemperatures",
        starter: `function dailyTemperatures(t) {\n  // return the wait-days array\n}`,
        tests: [
            { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
            { args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
            { args: [[30, 60, 90]], expected: [1, 1, 0] },
        ],
        hint: "Keep a stack of indices with decreasing temperatures. When a warmer day arrives, pop and record the gap.",
        solution: `function dailyTemperatures(t) {
  const res = new Array(t.length).fill(0);
  const st = [];
  for (let i = 0; i < t.length; i++) {
    while (st.length && t[i] > t[st[st.length - 1]]) {
      const j = st.pop();
      res[j] = i - j;
    }
    st.push(i);
  }
  return res;
}`,
    },
    {
        id: "decode-string",
        title: "Decode String",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Stacks & Queues",
        source: "LeetCode",
        tags: ["Stack", "String"],
        prompt: "Decode a string encoded as <code>k[encoded]</code>, meaning the bracketed substring repeats <code>k</code> times. Brackets may nest. Example: <code>3[a2[c]]</code> becomes <code>accaccacc</code>.",
        fnName: "decodeString",
        starter: `function decodeString(s) {\n  // return the decoded string\n}`,
        tests: [
            { args: ["3[a]2[bc]"], expected: "aaabcbc" },
            { args: ["3[a2[c]]"], expected: "accaccacc" },
            { args: ["2[abc]3[cd]ef"], expected: "abcabccdcdcdef" },
        ],
        hint: "Use two stacks: one for repeat counts, one for the string built before each '['. On ']' pop and expand.",
        solution: `function decodeString(s) {
  const numSt = [], strSt = [];
  let cur = "", num = 0;
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") num = num * 10 + Number(ch);
    else if (ch === "[") { numSt.push(num); strSt.push(cur); num = 0; cur = ""; }
    else if (ch === "]") { const k = numSt.pop(); cur = strSt.pop() + cur.repeat(k); }
    else cur += ch;
  }
  return cur;
}`,
    },
    {
        id: "asteroid-collision",
        title: "Asteroid Collision",
        difficulty: "Hard",
        practiceTrack: "dsa",
        topic: "Stacks & Queues",
        source: "LeetCode",
        tags: ["Stack", "Simulation"],
        prompt: "Each element of <code>asteroids</code> is a moving rock: positive moves right, negative moves left, absolute value is size. When two collide, the smaller explodes; equal sizes both explode; same-direction rocks never meet. Return the surviving asteroids in order.",
        fnName: "asteroidCollision",
        starter: `function asteroidCollision(asteroids) {\n  // return the survivors\n}`,
        tests: [
            { args: [[5, 10, -5]], expected: [5, 10] },
            { args: [[8, -8]], expected: [] },
            { args: [[10, 2, -5]], expected: [10] },
            { args: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2] },
        ],
        hint: "Use a stack. A left-moving rock only collides with a right-moving rock on top. Resolve collisions in a loop before pushing.",
        solution: `function asteroidCollision(asteroids) {
  const st = [];
  for (const x of asteroids) {
    let alive = true;
    while (alive && x < 0 && st.length > 0 && st[st.length - 1] > 0) {
      const top = st[st.length - 1];
      if (top < -x) st.pop();
      else if (top === -x) { st.pop(); alive = false; }
      else alive = false;
    }
    if (alive) st.push(x);
  }
  return st;
}`,
    },
    {
        id: "has-cycle",
        title: "Linked List Cycle",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Linked Lists",
        source: "Blind 75",
        tags: ["Linked List", "Two Pointers", "Floyd"],
        prompt: "A linked list is given as the array <code>values</code> plus an integer <code>pos</code>: the last node's <code>next</code> points to index <code>pos</code>, or <code>-1</code> for no cycle. Return <code>true</code> if the list has a cycle.",
        fnName: "hasCycle",
        starter: `function hasCycle(values, pos) {\n  // return true if there is a cycle\n}`,
        tests: [
            { args: [[3, 2, 0, -4], 1], expected: true },
            { args: [[1, 2], 0], expected: true },
            { args: [[1], -1], expected: false },
            { args: [[], -1], expected: false },
        ],
        hint: "Floyd's tortoise and hare: model next(i) as i+1, or pos when past the end (or -1 to stop). If slow meets fast, there is a cycle.",
        solution: `function hasCycle(values, pos) {
  const n = values.length;
  if (n === 0) return false;
  const next = (i) => (i + 1 < n ? i + 1 : pos);
  let slow = 0, fast = 0;
  while (true) {
    fast = next(fast);
    if (fast === -1) return false;
    fast = next(fast);
    if (fast === -1) return false;
    slow = next(slow);
    if (slow === fast) return true;
  }
}`,
    },
    {
        id: "remove-nth-from-end",
        title: "Remove Nth Node From End of List",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Linked Lists",
        source: "Blind 75",
        tags: ["Linked List", "Two Pointers"],
        prompt: "The linked list is given as an array <code>values</code>. Remove the <code>n</code>-th node counting from the end (1-indexed) and return the resulting array.",
        fnName: "removeNthFromEnd",
        starter: `function removeNthFromEnd(values, n) {\n  // return the list with the node removed\n}`,
        tests: [
            { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
            { args: [[1], 1], expected: [] },
            { args: [[1, 2], 1], expected: [1] },
        ],
        hint: "The node to remove is at index length - n from the front. Splice it out.",
        solution: `function removeNthFromEnd(values, n) {
  const out = [...values];
  out.splice(out.length - n, 1);
  return out;
}`,
    },
    {
        id: "add-two-numbers",
        title: "Add Two Numbers",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Linked Lists",
        source: "LeetCode",
        tags: ["Linked List", "Math"],
        prompt: "Two numbers are stored as digit arrays <code>l1</code> and <code>l2</code> in reverse order (least significant digit first). Return their sum as a digit array in the same reverse order.",
        fnName: "addTwoNumbers",
        starter: `function addTwoNumbers(l1, l2) {\n  // return the sum as a reversed digit array\n}`,
        tests: [
            { args: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
            { args: [[0], [0]], expected: [0] },
            { args: [[9, 9, 9], [1]], expected: [0, 0, 0, 1] },
        ],
        hint: "Walk both arrays adding digit + digit + carry, pushing value % 10 and carrying value / 10. Continue while a carry remains.",
        solution: `function addTwoNumbers(l1, l2) {
  const out = [];
  let carry = 0, i = 0;
  while (i < l1.length || i < l2.length || carry) {
    const d = (l1[i] || 0) + (l2[i] || 0) + carry;
    out.push(d % 10);
    carry = Math.floor(d / 10);
    i++;
  }
  return out;
}`,
    },
    {
        id: "level-order-traversal",
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Trees",
        source: "Blind 75",
        tags: ["Tree", "BFS"],
        prompt: "A binary tree is given as a level-order array with <code>null</code> for missing children. Return its level-order traversal as an array of arrays, one per depth level (top to bottom).",
        fnName: "levelOrder",
        starter: `function levelOrder(arr) {\n  // return an array of levels\n}`,
        tests: [
            { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
            { args: [[1]], expected: [[1]] },
            { args: [[]], expected: [] },
        ],
        hint: "Rebuild the tree from the level-order array, then BFS one level at a time, collecting values per level.",
        solution: `function levelOrder(arr) {
  function build(a) {
    if (!a.length || a[0] === null) return null;
    const root = { val: a[0], left: null, right: null };
    const q = [root];
    let i = 1;
    while (q.length && i < a.length) {
      const node = q.shift();
      if (i < a.length) { if (a[i] !== null) { node.left = { val: a[i], left: null, right: null }; q.push(node.left); } i++; }
      if (i < a.length) { if (a[i] !== null) { node.right = { val: a[i], left: null, right: null }; q.push(node.right); } i++; }
    }
    return root;
  }
  const root = build(arr);
  if (!root) return [];
  const res = [];
  let level = [root];
  while (level.length) {
    res.push(level.map((n) => n.val));
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}`,
    },
    {
        id: "symmetric-tree",
        title: "Symmetric Tree",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Trees",
        source: "LeetCode",
        tags: ["Tree", "Recursion"],
        prompt: "A binary tree is given as a level-order array with <code>null</code> for missing nodes. Return <code>true</code> if the tree is a mirror of itself around its center.",
        fnName: "isSymmetric",
        starter: `function isSymmetric(arr) {\n  // return true if the tree is symmetric\n}`,
        tests: [
            { args: [[1, 2, 2, 3, 4, 4, 3]], expected: true },
            { args: [[1, 2, 2, null, 3, null, 3]], expected: false },
            { args: [[]], expected: true },
        ],
        hint: "Rebuild the tree, then recursively compare the left subtree against the right: outer against outer, inner against inner.",
        solution: `function isSymmetric(arr) {
  function build(a) {
    if (!a.length || a[0] === null) return null;
    const root = { val: a[0], left: null, right: null };
    const q = [root];
    let i = 1;
    while (q.length && i < a.length) {
      const node = q.shift();
      if (i < a.length) { if (a[i] !== null) { node.left = { val: a[i], left: null, right: null }; q.push(node.left); } i++; }
      if (i < a.length) { if (a[i] !== null) { node.right = { val: a[i], left: null, right: null }; q.push(node.right); } i++; }
    }
    return root;
  }
  const root = build(arr);
  const mirror = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return !root || mirror(root.left, root.right);
}`,
    },
    {
        id: "diameter-binary-tree",
        title: "Diameter of Binary Tree",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Trees",
        source: "LeetCode",
        tags: ["Tree", "DFS"],
        prompt: "A binary tree is given as a level-order array with <code>null</code> for missing nodes. Return the diameter — the number of edges on the longest path between any two nodes (it need not pass through the root).",
        fnName: "diameterOfBinaryTree",
        starter: `function diameterOfBinaryTree(arr) {\n  // return the diameter in edges\n}`,
        tests: [
            { args: [[1, 2, 3, 4, 5]], expected: 3 },
            { args: [[1, 2]], expected: 1 },
            { args: [[]], expected: 0 },
        ],
        hint: "Post-order DFS returning each node's height. At each node, the longest path through it is leftHeight + rightHeight; track the maximum.",
        solution: `function diameterOfBinaryTree(arr) {
  function build(a) {
    if (!a.length || a[0] === null) return null;
    const root = { val: a[0], left: null, right: null };
    const q = [root];
    let i = 1;
    while (q.length && i < a.length) {
      const node = q.shift();
      if (i < a.length) { if (a[i] !== null) { node.left = { val: a[i], left: null, right: null }; q.push(node.left); } i++; }
      if (i < a.length) { if (a[i] !== null) { node.right = { val: a[i], left: null, right: null }; q.push(node.right); } i++; }
    }
    return root;
  }
  const root = build(arr);
  let best = 0;
  const h = (n) => {
    if (!n) return 0;
    const l = h(n.left), r = h(n.right);
    best = Math.max(best, l + r);
    return Math.max(l, r) + 1;
  };
  h(root);
  return best;
}`,
    },
    {
        id: "selection-sort",
        title: "Selection Sort",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Sorting",
        source: "Classic",
        tags: ["Sorting"],
        prompt: "Implement selection sort: repeatedly select the minimum of the unsorted suffix and place it next. Return a new ascending array. Do not use the built-in sort.",
        fnName: "selectionSort",
        starter: `function selectionSort(nums) {\n  // return the sorted array\n}`,
        tests: [
            { args: [[64, 25, 12, 22, 11]], expected: [11, 12, 22, 25, 64] },
            { args: [[5, 2, 4, 6, 1, 3]], expected: [1, 2, 3, 4, 5, 6] },
            { args: [[]], expected: [] },
        ],
        hint: "For each index i, scan i+1..end for the smallest element and swap it into position i.",
        solution: `function selectionSort(nums) {
  const a = [...nums];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j;
    [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}`,
    },
    {
        id: "merge-intervals",
        title: "Merge Intervals",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Sorting",
        source: "Blind 75",
        tags: ["Sorting", "Intervals"],
        prompt: "Given an array of <code>intervals</code> where each is <code>[start, end]</code>, merge all overlapping intervals and return the result sorted by start.",
        fnName: "mergeIntervals",
        starter: `function mergeIntervals(intervals) {\n  // return the merged intervals\n}`,
        tests: [
            { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
            { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
            { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
        ],
        hint: "Sort by start. Walk through; if the current interval starts within the last merged one, extend its end, otherwise append it.",
        solution: `function mergeIntervals(intervals) {
  const a = [...intervals].sort((x, y) => x[0] - y[0]);
  const res = [];
  for (const iv of a) {
    if (res.length && iv[0] <= res[res.length - 1][1]) {
      res[res.length - 1][1] = Math.max(res[res.length - 1][1], iv[1]);
    } else {
      res.push([...iv]);
    }
  }
  return res;
}`,
    },
    {
        id: "kth-largest",
        title: "Kth Largest Element in an Array",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Sorting",
        source: "Blind 75",
        tags: ["Sorting", "Selection"],
        prompt: "Given an array <code>nums</code> and integer <code>k</code>, return the <code>k</code>-th largest element (by value, in sorted order — not necessarily distinct).",
        fnName: "findKthLargest",
        starter: `function findKthLargest(nums, k) {\n  // return the kth largest value\n}`,
        tests: [
            { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
            { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
            { args: [[1], 1], expected: 1 },
        ],
        hint: "Sort descending and take index k-1 (a quickselect gives the same answer in O(n) average).",
        solution: `function findKthLargest(nums, k) {
  const a = [...nums].sort((x, y) => y - x);
  return a[k - 1];
}`,
    },
    {
        id: "sqrt-int",
        title: "Sqrt(x)",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Searching",
        source: "LeetCode",
        tags: ["Binary Search", "Math"],
        prompt: "Return the integer square root of a non-negative integer <code>x</code> — that is, <code>&lfloor;&radic;x&rfloor;</code>. Do not use <code>Math.sqrt</code>.",
        fnName: "mySqrt",
        starter: `function mySqrt(x) {\n  // return floor(sqrt(x))\n}`,
        tests: [
            { args: [4], expected: 2 },
            { args: [8], expected: 2 },
            { args: [0], expected: 0 },
            { args: [2147395600], expected: 46340 },
        ],
        hint: "Binary search over 1..x/2 for the largest m with m*m <= x.",
        solution: `function mySqrt(x) {
  if (x < 2) return x;
  let lo = 1, hi = Math.floor(x / 2), ans = 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid <= x) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}`,
    },
    {
        id: "peak-element",
        title: "Find Peak Element",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Searching",
        source: "LeetCode",
        tags: ["Binary Search", "Array"],
        prompt: "An element is a peak if it is strictly greater than its neighbors (out-of-bounds neighbors count as <code>-&infin;</code>). Given <code>nums</code>, return the index of any peak in O(log n).",
        fnName: "findPeakElement",
        starter: `function findPeakElement(nums) {\n  // return a peak index\n}`,
        tests: [
            { args: [[1, 2, 3, 1]], expected: 2 },
            { args: [[1, 2, 1, 3, 5, 6, 4]], expected: 5 },
            { args: [[1]], expected: 0 },
        ],
        hint: "Binary search: if nums[mid] < nums[mid+1] a peak lies to the right, otherwise it lies at mid or left.",
        solution: `function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
    },
    {
        id: "find-min-rotated",
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Searching",
        source: "Blind 75",
        tags: ["Binary Search", "Array"],
        prompt: "A sorted array of distinct values <code>nums</code> has been rotated at some pivot. Return the minimum element in O(log n).",
        fnName: "findMin",
        starter: `function findMin(nums) {\n  // return the minimum value\n}`,
        tests: [
            { args: [[3, 4, 5, 1, 2]], expected: 1 },
            { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
            { args: [[11, 13, 15, 17]], expected: 11 },
        ],
        hint: "Compare nums[mid] with nums[hi]: if larger, the minimum is to the right of mid, otherwise at mid or left.",
        solution: `function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}`,
    },
    {
        id: "min-cost-climbing-stairs",
        title: "Min Cost Climbing Stairs",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Recursion & DP",
        source: "LeetCode",
        tags: ["DP"],
        prompt: "Each index of <code>cost</code> is the price to step off that stair. You may start at index 0 or 1 and climb 1 or 2 stairs each move. Return the minimum cost to reach the top (just past the last index).",
        fnName: "minCostClimbingStairs",
        starter: `function minCostClimbingStairs(cost) {\n  // return the minimum cost\n}`,
        tests: [
            { args: [[10, 15, 20]], expected: 15 },
            { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
            { args: [[0, 0]], expected: 0 },
        ],
        hint: "dp[i] = min cost to reach step i = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Two rolling variables suffice.",
        solution: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  let a = 0, b = 0;
  for (let i = 2; i <= n; i++) {
    const c = Math.min(b + cost[i - 1], a + cost[i - 2]);
    a = b;
    b = c;
  }
  return b;
}`,
    },
    {
        id: "unique-paths",
        title: "Unique Paths",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Recursion & DP",
        source: "Blind 75",
        tags: ["DP", "Combinatorics"],
        prompt: "A robot starts at the top-left of an <code>m &times; n</code> grid and may only move right or down. Return the number of distinct paths to the bottom-right corner.",
        fnName: "uniquePaths",
        starter: `function uniquePaths(m, n) {\n  // return the path count\n}`,
        tests: [
            { args: [3, 7], expected: 28 },
            { args: [3, 2], expected: 3 },
            { args: [1, 1], expected: 1 },
        ],
        hint: "Each cell's path count is the sum of the cell above and the cell to the left. A single rolling row of length n works.",
        solution: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) row[j] += row[j - 1];
  }
  return row[n - 1];
}`,
    },
    {
        id: "edit-distance",
        title: "Edit Distance",
        difficulty: "Hard",
        practiceTrack: "dsa",
        topic: "Recursion & DP",
        source: "Blind 75",
        tags: ["DP", "String"],
        prompt: "Return the minimum number of single-character insertions, deletions, or substitutions to convert string <code>a</code> into string <code>b</code> (Levenshtein distance).",
        fnName: "minDistance",
        starter: `function minDistance(a, b) {\n  // return the edit distance\n}`,
        tests: [
            { args: ["horse", "ros"], expected: 3 },
            { args: ["intention", "execution"], expected: 5 },
            { args: ["", "abc"], expected: 3 },
        ],
        hint: "dp[i][j] = edits to convert a[0..i) into b[0..j). If the last chars match, inherit dp[i-1][j-1]; else 1 + min of the three neighbors.",
        solution: `function minDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
    },
    {
        id: "reverse-integer",
        title: "Reverse Integer",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Math",
        source: "LeetCode",
        tags: ["Math"],
        prompt: "Reverse the digits of a signed 32-bit integer <code>x</code>. If the reversed value overflows the range <code>[-2^31, 2^31 - 1]</code>, return <code>0</code>.",
        fnName: "reverseInteger",
        starter: `function reverseInteger(x) {\n  // return the reversed integer or 0 on overflow\n}`,
        tests: [
            { args: [123], expected: 321 },
            { args: [-123], expected: -321 },
            { args: [120], expected: 21 },
            { args: [1534236469], expected: 0 },
        ],
        hint: "Pop digits with %10 and build the result with *10. Check the 32-bit bounds before returning.",
        solution: `function reverseInteger(x) {
  const sign = x < 0 ? -1 : 1;
  let n = Math.abs(x), r = 0;
  while (n > 0) {
    r = r * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  r *= sign;
  if (r < -(2 ** 31) || r > 2 ** 31 - 1) return 0;
  return r;
}`,
    },
    {
        id: "palindrome-number",
        title: "Palindrome Number",
        difficulty: "Easy",
        practiceTrack: "dsa",
        topic: "Math",
        source: "LeetCode",
        tags: ["Math"],
        prompt: "Return <code>true</code> if the integer <code>x</code> reads the same forwards and backwards. Negative numbers are never palindromes.",
        fnName: "isPalindromeNumber",
        starter: `function isPalindromeNumber(x) {\n  // return true if x is a palindrome\n}`,
        tests: [
            { args: [121], expected: true },
            { args: [-121], expected: false },
            { args: [10], expected: false },
        ],
        hint: "Reject negatives, then two-pointer compare the decimal string from both ends.",
        solution: `function isPalindromeNumber(x) {
  if (x < 0) return false;
  const s = String(x);
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (s[i] !== s[j]) return false;
    i++; j--;
  }
  return true;
}`,
    },
    {
        id: "count-primes",
        title: "Count Primes",
        difficulty: "Medium",
        practiceTrack: "dsa",
        topic: "Math",
        source: "LeetCode",
        tags: ["Math", "Sieve"],
        prompt: "Return the number of prime numbers strictly less than a non-negative integer <code>n</code>.",
        fnName: "countPrimes",
        starter: `function countPrimes(n) {\n  // return the count of primes below n\n}`,
        tests: [
            { args: [10], expected: 4 },
            { args: [0], expected: 0 },
            { args: [20], expected: 8 },
        ],
        hint: "Sieve of Eratosthenes: mark multiples of each prime starting at i*i as composite, then count what remains.",
        solution: `function countPrimes(n) {
  if (n < 3) return 0;
  const sieve = new Array(n).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i < n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j < n; j += i) sieve[j] = false;
    }
  }
  return sieve.filter(Boolean).length;
}`,
    },
];
