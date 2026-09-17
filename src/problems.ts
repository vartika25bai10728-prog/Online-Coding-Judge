export interface TestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: { input: string; output: string }[];
  testCases: TestCase[];
  starterCode: Record<string, string>;
}

export interface Submission {
  id: string;
  problemId: number;
  problemTitle: string;
  language: string;
  verdict: 'ACCEPTED' | 'WRONG ANSWER' | 'RUNTIME ERROR';
  runtime: number;
  date: string;
}

export const PROBLEMS: Problem[] = [
  {
    id: 1,
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    inputFormat: 'Line 1: numbers separated by commas (e.g. 2,7,11,15)\nLine 2: target integer (e.g. 9)',
    outputFormat: 'Array of two indices [i, j]',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists'],
    examples: [
      { input: '2,7,11,15\n9', output: '[0, 1]' },
      { input: '3,2,4\n6', output: '[1, 2]' }
    ],
    testCases: [
      { input: '2,7,11,15\n9', expected: '[0, 1]' },
      { input: '3,2,4\n6', expected: '[1, 2]' },
      { input: '3,3\n6', expected: '[0, 1]' },
      { input: '1,5,8,3\n8', expected: '[1, 3]' }
    ],
    starterCode: {
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

nums = [int(x) for x in input().split(",")]
target = int(input())
print(two_sum(nums, target))`,
      javascript: `function twoSum(nums, target) {
    let map = {};
    for (let i = 0; i < nums.length; i++) {
        let diff = target - nums[i];
        if (map[diff] !== undefined) {
            return [map[diff], i];
        }
        map[nums[i]] = i;
    }
    return [];
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
    }
}`
    }
  },
  {
    id: 2,
    slug: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    inputFormat: 'Single integer x',
    outputFormat: 'true or false',
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    examples: [
      { input: '121', output: 'true' },
      { input: '-121', output: 'false' },
      { input: '10', output: 'false' }
    ],
    testCases: [
      { input: '121', expected: 'true' },
      { input: '-121', expected: 'false' },
      { input: '10', expected: 'false' },
      { input: '12321', expected: 'true' }
    ],
    starterCode: {
      python: `def is_palindrome(x):
    s = str(x)
    return s == s[::-1]

x = int(input())
print(str(is_palindrome(x)).lower())`,
      javascript: `function isPalindrome(x) {
    let s = x.toString();
    return s === s.split('').reverse().join('');
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int x;
    if (cin >> x) {
        string s = to_string(x);
        string r = string(s.rbegin(), s.rend());
        cout << (s == r ? "true" : "false");
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        String s = Integer.toString(x);
        String r = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(r));
    }
}`
    }
  },
  {
    id: 3,
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    inputFormat: 'A single string s of brackets',
    outputFormat: 'true or false',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}"'],
    examples: [
      { input: '()', output: 'true' },
      { input: '()[]{}', output: 'true' },
      { input: '(]', output: 'false' }
    ],
    testCases: [
      { input: '()', expected: 'true' },
      { input: '()[]{}', expected: 'true' },
      { input: '(]', expected: 'false' },
      { input: '([)]', expected: 'false' },
      { input: '{[]}', expected: 'true' }
    ],
    starterCode: {
      python: `def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in pairs:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    return len(stack) == 0

s = input().strip()
print(str(is_valid(s)).lower())`,
      javascript: `function isValid(s) {
    let stack = [];
    let map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
    }
}`
    }
  },
  {
    id: 4,
    slug: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: 'Write a program that takes an input string and outputs the reversed string.',
    inputFormat: 'A single line of text',
    outputFormat: 'The reversed line of text',
    constraints: ['1 <= s.length <= 10^5'],
    examples: [
      { input: 'hello', output: 'olleh' },
      { input: 'Hannah', output: 'hannaH' }
    ],
    testCases: [
      { input: 'hello', expected: 'olleh' },
      { input: 'Hannah', expected: 'hannaH' },
      { input: 'student', expected: 'tneduts' }
    ],
    starterCode: {
      python: `s = input()
print(s[::-1])`,
      javascript: `function reverseString(s) {
    return s.split('').reverse().join('');
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    if (getline(cin, s)) {
        reverse(s.begin(), s.end());
        cout << s << endl;
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            System.out.println(new StringBuilder(s).reverse().toString());
        }
    }
}`
    }
  },
  {
    id: 5,
    slug: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    inputFormat: 'Comma-separated integers',
    outputFormat: 'true or false',
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    examples: [
      { input: '1,2,3,1', output: 'true' },
      { input: '1,2,3,4', output: 'false' }
    ],
    testCases: [
      { input: '1,2,3,1', expected: 'true' },
      { input: '1,2,3,4', expected: 'false' },
      { input: '1,1,1,3,3,4,3,2,4,2', expected: 'true' }
    ],
    starterCode: {
      python: `def contains_duplicate(nums):
    return len(nums) != len(set(nums))

nums = [int(x) for x in input().split(",")]
print(str(contains_duplicate(nums)).lower())`,
      javascript: `function containsDuplicate(nums) {
    let set = new Set(nums);
    return set.size !== nums.length;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

int main() {
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
    }
}`
    }
  },
  {
    id: 6,
    slug: 'fizz-buzz',
    title: 'Fizz Buzz',
    difficulty: 'Easy',
    description: 'Given an integer n, return a string array answer (1-indexed) where: answer[i] == "FizzBuzz" if i is divisible by 3 and 5, answer[i] == "Fizz" if i is divisible by 3, answer[i] == "Buzz" if i is divisible by 5, or answer[i] == i as string.',
    inputFormat: 'A single integer n',
    outputFormat: 'Comma-separated values',
    constraints: ['1 <= n <= 10^4'],
    examples: [
      { input: '3', output: '1, 2, Fizz' },
      { input: '5', output: '1, 2, Fizz, 4, Buzz' }
    ],
    testCases: [
      { input: '3', expected: '1, 2, Fizz' },
      { input: '5', expected: '1, 2, Fizz, 4, Buzz' },
      { input: '15', expected: '1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz' }
    ],
    starterCode: {
      python: `def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return ", ".join(res)

n = int(input())
print(fizz_buzz(n))`,
      javascript: `function fizzBuzz(n) {
    let res = [];
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) res.push("FizzBuzz");
        else if (i % 3 === 0) res.push("Fizz");
        else if (i % 5 === 0) res.push("Buzz");
        else res.push(i.toString());
    }
    return res.join(", ");
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
    }
}`
    }
  },
  {
    id: 7,
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    inputFormat: 'Line 1: comma separated sorted numbers\nLine 2: target number',
    outputFormat: 'Index of target, or -1',
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted in ascending order'],
    examples: [
      { input: '-1,0,3,5,9,12\n9', output: '4' },
      { input: '-1,0,3,5,9,12\n2', output: '-1' }
    ],
    testCases: [
      { input: '-1,0,3,5,9,12\n9', expected: '4' },
      { input: '-1,0,3,5,9,12\n2', expected: '-1' },
      { input: '5\n5', expected: '0' }
    ],
    starterCode: {
      python: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

nums = [int(x) for x in input().split(",")]
target = int(input())
print(binary_search(nums, target))`,
      javascript: `function search(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
    }
}`
    }
  },
  {
    id: 8,
    slug: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    inputFormat: 'Comma-separated integers',
    outputFormat: 'Max sum integer',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', output: '6' },
      { input: '1', output: '1' },
      { input: '5,4,-1,7,8', output: '23' }
    ],
    testCases: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', expected: '6' },
      { input: '1', expected: '1' },
      { input: '5,4,-1,7,8', expected: '23' }
    ],
    starterCode: {
      python: `def max_sub_array(nums):
    curr_sum = max_sum = nums[0]
    for x in nums[1:]:
        curr_sum = max(x, curr_sum + x)
        max_sum = max(max_sum, curr_sum)
    return max_sum

nums = [int(x) for x in input().split(",")]
print(max_sub_array(nums))`,
      javascript: `function maxSubArray(nums) {
    let curr = nums[0];
    let maxS = nums[0];
    for (let i = 1; i < nums.length; i++) {
        curr = Math.max(nums[i], curr + nums[i]);
        maxS = Math.max(maxS, curr);
    }
    return maxS;
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
    }
}`
    }
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-101',
    problemId: 1,
    problemTitle: 'Two Sum',
    language: 'python',
    verdict: 'ACCEPTED',
    runtime: 18,
    date: '2026-09-17 09:12'
  },
  {
    id: 'sub-102',
    problemId: 2,
    problemTitle: 'Palindrome Number',
    language: 'python',
    verdict: 'ACCEPTED',
    runtime: 12,
    date: '2026-09-17 09:45'
  },
  {
    id: 'sub-103',
    problemId: 3,
    problemTitle: 'Valid Parentheses',
    language: 'javascript',
    verdict: 'ACCEPTED',
    runtime: 21,
    date: '2026-09-17 10:02'
  }
];

export const LEADERBOARD = [
  { rank: 1, name: 'alex_dev', solved: 8, rating: 1620 },
  { rank: 2, name: 'rahul_99', solved: 7, rating: 1540 },
  { rank: 3, name: 'priya_code', solved: 6, rating: 1480 },
  { rank: 4, name: 'student_user', solved: 5, rating: 1420 },
  { rank: 5, name: 'kevin_c', solved: 4, rating: 1350 }
];
