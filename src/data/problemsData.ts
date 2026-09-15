import { Problem, SupportedLanguage } from '../types';

export interface FullProblem extends Problem {
  hiddenTestCases: {
    input: string;
    expectedOutput: string;
  }[];
}

export const INITIAL_PROBLEMS: FullProblem[] = [
  {
    id: 'p-1',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'EASY',
    tags: ['Arrays', 'Hashing'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat: 'Line 1: JSON array of numbers nums. Line 2: target integer.',
    outputFormat: 'JSON array containing the two indices [i, j].',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: '[2,7,11,15]\n9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: '[3,2,4]\n6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: '[3,3]\n6',
        output: '[0,1]'
      }
    ],
    starterCode: {
      python: `import sys, json

def twoSum(nums, target):
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        result = twoSum(nums, target)
        print(json.dumps(result))
`,
      javascript: `const fs = require('fs');

function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
    const nums = JSON.parse(input[0]);
    const target = parseInt(input[1], 10);
    console.log(JSON.stringify(twoSum(nums, target)));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[]{map.get(comp), i};
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line1 = sc.nextLine().replaceAll("[\\[\\]\\\\s]", "");
            String[] parts = line1.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
            int target = Integer.parseInt(sc.nextLine().trim());
            int[] res = twoSum(nums, target);
            System.out.println(Arrays.toString(res).replaceAll(" ", ""));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (mp.count(complement)) {
            return {mp[complement], i};
        }
        mp[nums[i]] = i;
    }
    return {};
}

int main() {
    // Standard I/O harness
    return 0;
}
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    acceptanceRate: 51.2,
    totalSubmissions: 3120,
    totalAccepted: 1598,
    testCases: [
      { id: 't1-1', input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isPublic: true },
      { id: 't1-2', input: '[3,2,4]\n6', expectedOutput: '[1,2]', isPublic: true },
      { id: 't1-3', input: '[3,3]\n6', expectedOutput: '[0,1]', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[1,5,8,12,19,25]\n37', expectedOutput: '[3,5]' },
      { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]' },
      { input: '[1000000,500,1000000]\n2000000', expectedOutput: '[0,2]' }
    ]
  },
  {
    id: 'p-2',
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'EASY',
    tags: ['Strings', 'Stack'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputFormat: 'A single string s enclosed in quotes or plain string.',
    outputFormat: 'true or false',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    examples: [
      { input: '"()"', output: 'true' },
      { input: '"()[]{}"', output: 'true' },
      { input: '"(]"', output: 'false' },
      { input: '"([)]"', output: 'false' }
    ],
    starterCode: {
      python: `import sys, json

def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line.startswith('"') and line.endswith('"'):
        line = json.loads(line)
    print(str(isValid(line)).lower())
`,
      javascript: `const fs = require('fs');

function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}

let input = fs.readFileSync(0, 'utf-8').trim();
if (input.startsWith('"')) input = JSON.parse(input);
console.log(isValid(input));
`,
      java: `import java.util.*;

public class Solution {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine().trim().replace("\"", "");
            System.out.println(isValid(s));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '{') st.push('}');
        else if (c == '[') st.push(']');
        else {
            if (st.empty() || st.top() != c) return false;
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (cin >> s) {
        if (s.front() == '"' && s.back() == '"') s = s.substr(1, s.length() - 2);
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
`
    },
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    acceptanceRate: 40.8,
    totalSubmissions: 2450,
    totalAccepted: 1000,
    testCases: [
      { id: 't2-1', input: '"()"', expectedOutput: 'true', isPublic: true },
      { id: 't2-2', input: '"()[]{}"', expectedOutput: 'true', isPublic: true },
      { id: 't2-3', input: '"(]"', expectedOutput: 'false', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '"{[]}"', expectedOutput: 'true' },
      { input: '"([)]"', expectedOutput: 'false' },
      { input: '"(((((((((())))))))))"', expectedOutput: 'true' },
      { input: '"]"', expectedOutput: 'false' }
    ]
  },
  {
    id: 'p-3',
    slug: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'EASY',
    tags: ['Arrays', 'Sliding Window'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    inputFormat: 'Line 1: JSON array of integer prices.',
    outputFormat: 'Integer representing maximum profit.',
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    examples: [
      {
        input: '[7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
      },
      {
        input: '[7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and max profit = 0.'
      }
    ],
    starterCode: {
      python: `import sys, json

def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        prices = json.loads(line)
        print(maxProfit(prices))
`,
      javascript: `const fs = require('fs');

function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProf = 0;
    for (const p of prices) {
        if (p < minPrice) minPrice = p;
        else if (p - minPrice > maxProf) maxProf = p - minPrice;
    }
    return maxProf;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    console.log(maxProfit(JSON.parse(input)));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int p : prices) {
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
        }
        return maxProfit;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replaceAll("[\\[\\]\\\\s]", "");
            String[] parts = line.split(",");
            int[] prices = new int[parts.length];
            for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i]);
            System.out.println(maxProfit(prices));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxProfit(vector<int>& prices) {
    int min_p = 1e9, max_prof = 0;
    for (int p : prices) {
        min_p = min(min_p, p);
        max_prof = max(max_prof, p - min_p);
    }
    return max_prof;
}

int main() {
    // solution logic
    return 0;
}
`
    },
    timeLimitMs: 1200,
    memoryLimitMb: 128,
    acceptanceRate: 54.1,
    totalSubmissions: 2800,
    totalAccepted: 1515,
    testCases: [
      { id: 't3-1', input: '[7,1,5,3,6,4]', expectedOutput: '5', isPublic: true },
      { id: 't3-2', input: '[7,6,4,3,1]', expectedOutput: '0', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[2,4,1]', expectedOutput: '2' },
      { input: '[1,2,3,4,5,6,7,8,9,10]', expectedOutput: '9' },
      { input: '[3,3,3,3,3]', expectedOutput: '0' }
    ]
  },
  {
    id: 'p-4',
    slug: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Dynamic Programming'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    inputFormat: 'Line 1: JSON array of numbers.',
    outputFormat: 'Integer representing maximum subarray sum.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: '[1]',
        output: '1'
      },
      {
        input: '[5,4,-1,7,8]',
        output: '23'
      }
    ],
    starterCode: {
      python: `import sys, json

def maxSubArray(nums):
    max_sum = nums[0]
    current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        nums = json.loads(line)
        print(maxSubArray(nums))
`,
      javascript: `const fs = require('fs');

function maxSubArray(nums) {
    let maxSum = nums[0];
    let curSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        curSum = Math.max(nums[i], curSum + nums[i]);
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    console.log(maxSubArray(JSON.parse(input)));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int maxSubArray(int[] nums) {
        int maxSum = nums[0], curSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            curSum = Math.max(nums[i], curSum + nums[i]);
            maxSum = Math.max(maxSum, curSum);
        }
        return maxSum;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replaceAll("[\\[\\]\\\\s]", "");
            String[] parts = line.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
            System.out.println(maxSubArray(nums));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    int max_s = nums[0], cur = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        cur = max(nums[i], cur + nums[i]);
        max_s = max(max_s, cur);
    }
    return max_s;
}

int main() {
    return 0;
}
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    acceptanceRate: 50.3,
    totalSubmissions: 2900,
    totalAccepted: 1458,
    testCases: [
      { id: 't4-1', input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isPublic: true },
      { id: 't4-2', input: '[1]', expectedOutput: '1', isPublic: true },
      { id: 't4-3', input: '[5,4,-1,7,8]', expectedOutput: '23', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[-1]', expectedOutput: '-1' },
      { input: '[-2,-1]', expectedOutput: '-1' },
      { input: '[-5, -2, -8, -1, -4]', expectedOutput: '-1' }
    ]
  },
  {
    id: 'p-5',
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    tags: ['Strings', 'Sliding Window', 'Hashing'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    inputFormat: 'A single string enclosed in quotes.',
    outputFormat: 'Integer length of longest substring.',
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      { input: '"abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: '"bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: '"pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' }
    ],
    starterCode: {
      python: `import sys, json

def lengthOfLongestSubstring(s: str) -> int:
    char_index = {}
    max_len = 0
    start = 0
    for i, ch in enumerate(s):
        if ch in char_index and char_index[ch] >= start:
            start = char_index[ch] + 1
        char_index[ch] = i
        max_len = max(max_len, i - start + 1)
    return max_len

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line.startswith('"') and line.endswith('"'):
        line = json.loads(line)
    print(lengthOfLongestSubstring(line))
`,
      javascript: `const fs = require('fs');

function lengthOfLongestSubstring(s) {
    const map = new Map();
    let maxLen = 0, start = 0;
    for (let i = 0; i < s.length; i++) {
        if (map.has(s[i]) && map.get(s[i]) >= start) {
            start = map.get(s[i]) + 1;
        }
        map.set(s[i], i);
        maxLen = Math.max(maxLen, i - start + 1);
    }
    return maxLen;
}

let input = fs.readFileSync(0, 'utf-8').trim();
if (input.startsWith('"')) input = JSON.parse(input);
console.log(lengthOfLongestSubstring(input));
`,
      java: `import java.util.*;

public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        int n = s.length(), ans = 0;
        Map<Character, Integer> map = new HashMap<>();
        for (int j = 0, i = 0; j < n; j++) {
            if (map.containsKey(s.charAt(j))) {
                i = Math.max(map.get(s.charAt(j)), i);
            }
            ans = Math.max(ans, j - i + 1);
            map.put(s.charAt(j), j + 1);
        }
        return ans;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine().trim().replace("\"", "");
            System.out.println(lengthOfLongestSubstring(s));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(string s) {
    vector<int> last(256, -1);
    int res = 0, start = -1;
    for (int i = 0; i < s.length(); ++i) {
        if (last[(unsigned char)s[i]] > start) start = last[(unsigned char)s[i]];
        last[(unsigned char)s[i]] = i;
        res = max(res, i - start);
    }
    return res;
}

int main() {
    return 0;
}
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    acceptanceRate: 34.8,
    totalSubmissions: 3410,
    totalAccepted: 1186,
    testCases: [
      { id: 't5-1', input: '"abcabcbb"', expectedOutput: '3', isPublic: true },
      { id: 't5-2', input: '"bbbbb"', expectedOutput: '1', isPublic: true },
      { id: 't5-3', input: '"pwwkew"', expectedOutput: '3', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '""', expectedOutput: '0' },
      { input: '" "', expectedOutput: '1' },
      { input: '"au"', expectedOutput: '2' },
      { input: '"dvdf"', expectedOutput: '3' }
    ]
  },
  {
    id: 'p-6',
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Two Pointers', 'Greedy'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.`,
    inputFormat: 'JSON array of integers representing heights.',
    outputFormat: 'Integer representing maximum water volume.',
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    examples: [
      {
        input: '[1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The lines are at index 1 (height 8) and index 8 (height 7). Water stored is 7 * 7 = 49.'
      },
      {
        input: '[1,1]',
        output: '1'
      }
    ],
    starterCode: {
      python: `import sys, json

def maxArea(height):
    l, r = 0, len(height) - 1
    max_w = 0
    while l < r:
        h = min(height[l], height[r])
        max_w = max(max_w, h * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return max_w

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        height = json.loads(line)
        print(maxArea(height))
`,
      javascript: `const fs = require('fs');

function maxArea(height) {
    let l = 0, r = height.length - 1, maxW = 0;
    while (l < r) {
        const h = Math.min(height[l], height[r]);
        maxW = Math.max(maxW, h * (r - l));
        if (height[l] < height[r]) l++;
        else r--;
    }
    return maxW;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(maxArea(JSON.parse(input)));
`,
      java: `import java.util.*;

public class Solution {
    public static int maxArea(int[] height) {
        int l = 0, r = height.length - 1, maxW = 0;
        while (l < r) {
            int h = Math.min(height[l], height[r]);
            maxW = Math.max(maxW, h * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return maxW;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replaceAll("[\\[\\]\\\\s]", "");
            String[] parts = line.split(",");
            int[] h = new int[parts.length];
            for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i]);
            System.out.println(maxArea(h));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxArea(vector<int>& height) {
    int l = 0, r = height.size() - 1, max_w = 0;
    while (l < r) {
        max_w = max(max_w, min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l++;
        else r--;
    }
    return max_w;
}

int main() { return 0; }
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    acceptanceRate: 54.3,
    totalSubmissions: 2100,
    totalAccepted: 1140,
    testCases: [
      { id: 't6-1', input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isPublic: true },
      { id: 't6-2', input: '[1,1]', expectedOutput: '1', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[4,3,2,1,4]', expectedOutput: '16' },
      { input: '[1,2,1]', expectedOutput: '2' },
      { input: '[2,3,4,5,18,17,6]', expectedOutput: '17' }
    ]
  },
  {
    id: 'p-7',
    slug: 'coin-change',
    title: 'Coin Change',
    difficulty: 'MEDIUM',
    tags: ['Dynamic Programming', 'Breadth-First Search'],
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    inputFormat: 'Line 1: JSON array of coin denominations. Line 2: amount integer.',
    outputFormat: 'Integer representing minimum coins or -1.',
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    examples: [
      { input: '[1,2,5]\n11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: '[2]\n3', output: '-1' },
      { input: '[1]\n0', output: '0' }
    ],
    starterCode: {
      python: `import sys, json

def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        coins = json.loads(lines[0])
        amount = int(lines[1])
        print(coinChange(coins, amount))
`,
      javascript: `const fs = require('fs');

function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (const coin of coins) {
        for (let i = coin; i <= amount; i++) {
            dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
    const coins = JSON.parse(lines[0]);
    const amount = parseInt(lines[1], 10);
    console.log(coinChange(coins, amount));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int coinChange(int[] coins, int amount) {
        int max = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, max);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replaceAll("[\\[\\]\\\\s]", "");
            String[] parts = line.split(",");
            int[] coins = new int[parts.length];
            for (int i = 0; i < parts.length; i++) coins[i] = Integer.parseInt(parts[i]);
            int amount = Integer.parseInt(sc.nextLine().trim());
            System.out.println(coinChange(coins, amount));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int coin : coins) {
        for (int i = coin; i <= amount; ++i) {
            dp[i] = min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}

int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 42.6,
    totalSubmissions: 2600,
    totalAccepted: 1108,
    testCases: [
      { id: 't7-1', input: '[1,2,5]\n11', expectedOutput: '3', isPublic: true },
      { id: 't7-2', input: '[2]\n3', expectedOutput: '-1', isPublic: true },
      { id: 't7-3', input: '[1]\n0', expectedOutput: '0', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[186,419,83,408]\n6249', expectedOutput: '20' },
      { input: '[1,3,4,5]\n7', expectedOutput: '2' },
      { input: '[2,5,10,1]\n27', expectedOutput: '4' }
    ]
  },
  {
    id: 'p-8',
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'HARD',
    tags: ['Arrays', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    inputFormat: 'JSON array of integers representing elevation map.',
    outputFormat: 'Integer total trapped water units.',
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    examples: [
      {
        input: '[0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are trapped.'
      },
      {
        input: '[4,2,0,3,2,5]',
        output: '9'
      }
    ],
    starterCode: {
      python: `import sys, json

def trap(height):
    if not height:
        return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]
    return water

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(trap(json.loads(line)))
`,
      javascript: `const fs = require('fs');

function trap(height) {
    let l = 0, r = height.length - 1;
    let leftMax = height[l], rightMax = height[r];
    let water = 0;
    while (l < r) {
        if (leftMax < rightMax) {
            l++;
            leftMax = Math.max(leftMax, height[l]);
            water += leftMax - height[l];
        } else {
            r--;
            rightMax = Math.max(rightMax, height[r]);
            water += rightMax - height[r];
        }
    }
    return water;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(trap(JSON.parse(input)));
`,
      java: `import java.util.*;

public class Solution {
    public static int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] <= height[r]) {
                if (height[l] >= leftMax) leftMax = height[l];
                else water += leftMax - height[l];
                l++;
            } else {
                if (height[r] >= rightMax) rightMax = height[r];
                else water += rightMax - height[r];
                r--;
            }
        }
        return water;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replaceAll("[\\[\\]\\\\s]", "");
            String[] parts = line.split(",");
            int[] h = new int[parts.length];
            for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i]);
            System.out.println(trap(h));
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int trap(vector<int>& height) {
    int l = 0, r = height.size() - 1, lmax = 0, rmax = 0, ans = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            if (height[l] >= lmax) lmax = height[l];
            else ans += lmax - height[l];
            l++;
        } else {
            if (height[r] >= rmax) rmax = height[r];
            else ans += rmax - height[r];
            r--;
        }
    }
    return ans;
}

int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 59.8,
    totalSubmissions: 3900,
    totalAccepted: 2332,
    testCases: [
      { id: 't8-1', input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isPublic: true },
      { id: 't8-2', input: '[4,2,0,3,2,5]', expectedOutput: '9', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[2,0,2]', expectedOutput: '2' },
      { input: '[3,0,0,2,0,4]', expectedOutput: '10' },
      { input: '[5,4,1,2]', expectedOutput: '1' }
    ]
  },
  {
    id: 'p-9',
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'EASY',
    tags: ['Dynamic Programming', 'Math', 'Recursion'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    inputFormat: 'Integer n representing number of steps.',
    outputFormat: 'Integer distinct ways to reach the top.',
    constraints: ['1 <= n <= 45'],
    examples: [
      { input: '2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
      { input: '3', output: '3', explanation: '1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step' }
    ],
    starterCode: {
      python: `import sys

def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(climbStairs(int(line)))
`,
      javascript: `const fs = require('fs');

function climbStairs(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        const next = a + b;
        a = b;
        b = next;
    }
    return b;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(climbStairs(parseInt(input, 10)));
`,
      java: `import java.util.*;

public class Solution {
    public static int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int t = a + b;
            a = b;
            b = t;
        }
        return b;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) System.out.println(climbStairs(sc.nextInt()));
    }
}
`,
      cpp: `#include <iostream>
using namespace std;

int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main() { return 0; }
`
    },
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    acceptanceRate: 52.4,
    totalSubmissions: 3500,
    totalAccepted: 1834,
    testCases: [
      { id: 't9-1', input: '2', expectedOutput: '2', isPublic: true },
      { id: 't9-2', input: '3', expectedOutput: '3', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '4', expectedOutput: '5' },
      { input: '5', expectedOutput: '8' },
      { input: '10', expectedOutput: '89' },
      { input: '20', expectedOutput: '10946' }
    ]
  },
  {
    id: 'p-10',
    slug: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'MEDIUM',
    tags: ['Graphs', 'Breadth-First Search', 'Depth-First Search', 'Arrays'],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    inputFormat: 'JSON 2D array of string or char characters ["1","0"].',
    outputFormat: 'Integer total number of islands.',
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] is \'0\' or \'1\'.'
    ],
    examples: [
      {
        input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1'
      },
      {
        input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3'
      }
    ],
    starterCode: {
      python: `import sys, json

def numIslands(grid):
    if not grid:
        return 0
    m, n = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
        
    for r in range(m):
        for c in range(n):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        grid = json.loads(line)
        print(numIslands(grid))
`,
      javascript: `const fs = require('fs');

function numIslands(grid) {
    if (!grid.length) return 0;
    const m = grid.length, n = grid[0].length;
    let count = 0;
    
    function dfs(r, c) {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;
        grid[r][c] = '0';
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }
    
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === '1') {
                dfs(r, c);
                count++;
            }
        }
    }
    return count;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(numIslands(JSON.parse(input)));
`,
      java: `import java.util.*;

public class Solution {
    public static int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    dfs(grid, r, c);
                    count++;
                }
            }
        }
        return count;
    }
    static void dfs(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
    public static void main(String[] args) {
        // parser logic
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void dfs(vector<vector<char>>& grid, int r, int c) {
    if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != '1') return;
    grid[r][c] = '0';
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}

int numIslands(vector<vector<char>>& grid) {
    int ans = 0;
    for (int r = 0; r < grid.size(); ++r) {
        for (int c = 0; c < grid[0].size(); ++c) {
            if (grid[r][c] == '1') {
                dfs(grid, r, c);
                ans++;
            }
        }
    }
    return ans;
}

int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 57.1,
    totalSubmissions: 2500,
    totalAccepted: 1427,
    testCases: [
      {
        id: 't10-1',
        input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        expectedOutput: '1',
        isPublic: true
      },
      {
        id: 't10-2',
        input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        expectedOutput: '3',
        isPublic: true
      }
    ],
    hiddenTestCases: [
      { input: '[["1"]]', expectedOutput: '1' },
      { input: '[["0"]]', expectedOutput: '0' },
      { input: '[["1","0","1"],["0","1","0"],["1","0","1"]]', expectedOutput: '5' }
    ]
  },
  {
    id: 'p-11',
    slug: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Hashing', 'Strings'],
    description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in **any order**.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    inputFormat: 'JSON array of strings.',
    outputFormat: 'Sorted JSON 2D array of grouped strings.',
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.'
    ],
    examples: [
      {
        input: '["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]'
      },
      {
        input: '[""]',
        output: '[[""]]'
      },
      {
        input: '["a"]',
        output: '[["a"]]'
      }
    ],
    starterCode: {
      python: `import sys, json
from collections import defaultdict

def groupAnagrams(strs):
    ans = defaultdict(list)
    for s in strs:
        ans[tuple(sorted(s))].append(s)
    res = [sorted(group) for group in ans.values()]
    res.sort(key=lambda g: (len(g), g[0] if g else ""))
    return res

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        strs = json.loads(line)
        print(json.dumps(groupAnagrams(strs)))
`,
      javascript: `const fs = require('fs');

function groupAnagrams(strs) {
    const map = {};
    for (const s of strs) {
        const key = s.split('').sort().join('');
        if (!map[key]) map[key] = [];
        map[key].push(s);
    }
    const res = Object.values(map).map(g => g.sort());
    res.sort((a, b) => a.length - b.length || (a[0] || '').localeCompare(b[0] || ''));
    return res;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(JSON.stringify(groupAnagrams(JSON.parse(input))));
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // group anagrams
    }
}
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    acceptanceRate: 67.2,
    totalSubmissions: 2200,
    totalAccepted: 1478,
    testCases: [
      { id: 't11-1', input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isPublic: true },
      { id: 't11-2', input: '[""]', expectedOutput: '[[""]]', isPublic: true },
      { id: 't11-3', input: '["a"]', expectedOutput: '[["a"]]', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '["ab","ba","bac","cab","abc"]', expectedOutput: '[["ab","ba"],["abc","bac","cab"]]' },
      { input: '["stop","pots","spot","tops"]', expectedOutput: '[["pots","spot","stop","tops"]]' }
    ]
  },
  {
    id: 'p-12',
    slug: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Binary Search'],
    description: `There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is **possibly rotated** at an unknown pivot index \`k\` (\`1 <= k < nums.length\`).

Given the array \`nums\` after the possible rotation and an integer \`target\`, return *the index of* \`target\` *if it is in* \`nums\`, *or* \`-1\` *if it is not in* \`nums\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    inputFormat: 'Line 1: JSON array of rotated numbers. Line 2: target integer.',
    outputFormat: 'Integer index or -1.',
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is an ascending array that is possibly rotated.',
      '-10^4 <= target <= 10^4'
    ],
    examples: [
      { input: '[4,5,6,7,0,1,2]\n0', output: '4' },
      { input: '[4,5,6,7,0,1,2]\n3', output: '-1' },
      { input: '[1]\n0', output: '-1' }
    ],
    starterCode: {
      python: `import sys, json

def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]:
                r = mid - 1
            else:
                l = mid + 1
        else:
            if nums[mid] < target <= nums[r]:
                l = mid + 1
            else:
                r = mid - 1
    return -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        print(search(nums, target))
`,
      javascript: `const fs = require('fs');

function search(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        if (nums[mid] === target) return mid;
        if (nums[l] <= nums[mid]) {
            if (nums[l] <= target && target < nums[mid]) r = mid - 1;
            else l = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[r]) l = mid + 1;
            else r = mid - 1;
        }
    }
    return -1;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
    console.log(search(JSON.parse(lines[0]), parseInt(lines[1], 10)));
}
`,
      java: `import java.util.*;

public class Solution {
    public static int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        return -1;
    }
    public static void main(String[] args) {}
}
`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 128,
    acceptanceRate: 39.5,
    totalSubmissions: 2300,
    totalAccepted: 908,
    testCases: [
      { id: 't12-1', input: '[4,5,6,7,0,1,2]\n0', expectedOutput: '4', isPublic: true },
      { id: 't12-2', input: '[4,5,6,7,0,1,2]\n3', expectedOutput: '-1', isPublic: true },
      { id: 't12-3', input: '[1]\n0', expectedOutput: '-1', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[1,3]\n3', expectedOutput: '1' },
      { input: '[5,1,3]\n5', expectedOutput: '0' },
      { input: '[4,5,6,7,8,1,2,3]\n8', expectedOutput: '4' }
    ]
  },
  {
    id: 'p-13',
    slug: 'daily-temperatures',
    title: 'Daily Temperatures',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Stack', 'Monotonic Stack'],
    description: `Given an array of integers \`temperatures\` represents the daily temperatures, return *an array* \`answer\` *such that* \`answer[i]\` *is the number of days you have to wait after the* \`i\`-th *day to get a warmer temperature*. If there is no future day for which this is possible, keep \`answer[i] == 0\` instead.`,
    inputFormat: 'JSON array of integers.',
    outputFormat: 'JSON array of integers.',
    constraints: [
      '1 <= temperatures.length <= 10^5',
      '30 <= temperatures[i] <= 100'
    ],
    examples: [
      {
        input: '[73,74,75,71,69,72,76,73]',
        output: '[1,1,4,2,1,1,0,0]'
      },
      {
        input: '[30,40,50,60]',
        output: '[1,1,1,0]'
      },
      {
        input: '[30,60,90]',
        output: '[1,1,0]'
      }
    ],
    starterCode: {
      python: `import sys, json

def dailyTemperatures(temperatures):
    n = len(temperatures)
    ans = [0] * n
    stack = [] # stack of indices
    for i, t in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < t:
            prev_i = stack.pop()
            ans[prev_i] = i - prev_i
        stack.append(i)
    return ans

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        temps = json.loads(line)
        print(json.dumps(dailyTemperatures(temps)))
`,
      javascript: `const fs = require('fs');

function dailyTemperatures(temperatures) {
    const n = temperatures.length;
    const ans = new Array(n).fill(0);
    const stack = [];
    for (let i = 0; i < n; i++) {
        while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
            const prev = stack.pop();
            ans[prev] = i - prev;
        }
        stack.push(i);
    }
    return ans;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(JSON.stringify(dailyTemperatures(JSON.parse(input))));
`,
      java: `import java.util.*;

public class Solution {
    public static int[] dailyTemperatures(int[] temperatures) {
        int[] ans = new int[temperatures.length];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < temperatures.length; i++) {
            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                int prev = stack.pop();
                ans[prev] = i - prev;
            }
            stack.push(i);
        }
        return ans;
    }
    public static void main(String[] args) {}
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    acceptanceRate: 66.4,
    totalSubmissions: 2040,
    totalAccepted: 1354,
    testCases: [
      { id: 't13-1', input: '[73,74,75,71,69,72,76,73]', expectedOutput: '[1,1,4,2,1,1,0,0]', isPublic: true },
      { id: 't13-2', input: '[30,40,50,60]', expectedOutput: '[1,1,1,0]', isPublic: true },
      { id: 't13-3', input: '[30,60,90]', expectedOutput: '[1,1,0]', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[89,62,70,58,47,47,46,76,100,70]', expectedOutput: '[8,1,5,4,3,1,1,1,0,0]' },
      { input: '[50,50,50]', expectedOutput: '[0,0,0]' }
    ]
  },
  {
    id: 'p-14',
    slug: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Sorting'],
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    inputFormat: 'JSON 2D array of interval pairs.',
    outputFormat: 'JSON 2D array of merged interval pairs.',
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= start_i <= end_i <= 10^4'
    ],
    examples: [
      {
        input: '[[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
      },
      {
        input: '[[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.'
      }
    ],
    starterCode: {
      python: `import sys, json

def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        intervals = json.loads(line)
        print(json.dumps(merge(intervals)))
`,
      javascript: `const fs = require('fs');

function merge(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const item of intervals) {
        if (!merged.length || merged[merged.length - 1][1] < item[0]) {
            merged.push(item);
        } else {
            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], item[1]);
        }
    }
    return merged;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(JSON.stringify(merge(JSON.parse(input))));
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {}
}
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    acceptanceRate: 46.8,
    totalSubmissions: 2800,
    totalAccepted: 1310,
    testCases: [
      { id: 't14-1', input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isPublic: true },
      { id: 't14-2', input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]' },
      { input: '[[1,4],[2,3]]', expectedOutput: '[[1,4]]' },
      { input: '[[2,3],[4,5],[6,7],[8,9],[1,10]]', expectedOutput: '[[1,10]]' }
    ]
  },
  {
    id: 'p-15',
    slug: 'median-of-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'HARD',
    tags: ['Arrays', 'Binary Search', 'Divide and Conquer'],
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.`,
    inputFormat: 'Line 1: JSON array nums1. Line 2: JSON array nums2.',
    outputFormat: 'Float or integer formatted with up to 5 decimals.',
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6'
    ],
    examples: [
      {
        input: '[1,3]\n[2]',
        output: '2.0',
        explanation: 'merged array = [1,2,3] and median is 2.'
      },
      {
        input: '[1,2]\n[3,4]',
        output: '2.5',
        explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
      }
    ],
    starterCode: {
      python: `import sys, json

def findMedianSortedArrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    m, n = len(nums1), len(nums2)
    imin, imax, half_len = 0, m, (m + n + 1) // 2
    while imin <= imax:
        i = (imin + imax) // 2
        j = half_len - i
        if i < m and nums2[j-1] > nums1[i]:
            imin = i + 1
        elif i > 0 and nums1[i-1] > nums2[j]:
            imax = i - 1
        else:
            if i == 0: max_of_left = nums2[j-1]
            elif j == 0: max_of_left = nums1[i-1]
            else: max_of_left = max(nums1[i-1], nums2[j-1])
            
            if (m + n) % 2 == 1:
                return float(max_of_left)
                
            if i == m: min_of_right = nums2[j]
            elif j == n: min_of_right = nums1[i]
            else: min_of_right = min(nums1[i], nums2[j])
            
            return (max_of_left + min_of_right) / 2.0

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        nums1 = json.loads(lines[0])
        nums2 = json.loads(lines[1])
        med = findMedianSortedArrays(nums1, nums2)
        print(f"{med:.1f}" if med.is_integer() or (med * 10).is_integer() else f"{med:.5f}".rstrip('0'))
`,
      javascript: `const fs = require('fs');

function findMedianSortedArrays(nums1, nums2) {
    const merged = [];
    let i = 0, j = 0;
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) merged.push(nums1[i++]);
        else merged.push(nums2[j++]);
    }
    while (i < nums1.length) merged.push(nums1[i++]);
    while (j < nums2.length) merged.push(nums2[j++]);
    const mid = Math.floor(merged.length / 2);
    if (merged.length % 2 === 1) return merged[mid].toFixed(1);
    return ((merged[mid - 1] + merged[mid]) / 2).toFixed(1);
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
    console.log(findMedianSortedArrays(JSON.parse(lines[0]), JSON.parse(lines[1])));
}
`,
      java: `import java.util.*;
public class Solution { public static void main(String[] args) {} }
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 38.2,
    totalSubmissions: 3100,
    totalAccepted: 1184,
    testCases: [
      { id: 't15-1', input: '[1,3]\n[2]', expectedOutput: '2.0', isPublic: true },
      { id: 't15-2', input: '[1,2]\n[3,4]', expectedOutput: '2.5', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[0,0]\n[0,0]', expectedOutput: '0.0' },
      { input: '[]\n[1]', expectedOutput: '1.0' },
      { input: '[2]\n[]', expectedOutput: '2.0' }
    ]
  },
  {
    id: 'p-16',
    slug: 'edit-distance',
    title: 'Edit Distance',
    difficulty: 'HARD',
    tags: ['Strings', 'Dynamic Programming'],
    description: `Given two strings \`word1\` and \`word2\`, return *the minimum number of operations required to convert* \`word1\` *to* \`word2\`.

You have the following three operations permitted on a word:
- Insert a character
- Delete a character
- Replace a character`,
    inputFormat: 'Line 1: string word1. Line 2: string word2.',
    outputFormat: 'Integer minimum edit operations.',
    constraints: [
      '0 <= word1.length, word2.length <= 500',
      'word1 and word2 consist of lowercase English letters.'
    ],
    examples: [
      {
        input: '"horse"\n"ros"',
        output: '3',
        explanation: 'horse -> rorse (replace \'h\' with \'r\') -> rose (remove \'r\') -> ros (remove \'e\')'
      },
      {
        input: '"intention"\n"execution"',
        output: '5',
        explanation: 'intention -> inention (delete \'t\') -> enention (replace \'i\' with \'e\') -> exention (replace \'n\' with \'x\') -> exection (replace \'n\' with \'c\') -> execution (insert \'u\')'
      }
    ],
    starterCode: {
      python: `import sys, json

def minDistance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        w1 = json.loads(lines[0]) if lines[0].startswith('"') else lines[0]
        w2 = json.loads(lines[1]) if lines[1].startswith('"') else lines[1]
        print(minDistance(w1, w2))
`,
      javascript: `const fs = require('fs');

function minDistance(word1, word2) {
    const m = word1.length, n = word2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i-1] === word2[j-1]) dp[i][j] = dp[i-1][j-1];
            else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        }
    }
    return dp[m][n];
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
    const w1 = lines[0].startsWith('"') ? JSON.parse(lines[0]) : lines[0];
    const w2 = lines[1].startsWith('"') ? JSON.parse(lines[1]) : lines[1];
    console.log(minDistance(w1, w2));
}
`,
      java: `import java.util.*;
public class Solution { public static void main(String[] args) {} }
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 55.4,
    totalSubmissions: 2190,
    totalAccepted: 1213,
    testCases: [
      { id: 't16-1', input: '"horse"\n"ros"', expectedOutput: '3', isPublic: true },
      { id: 't16-2', input: '"intention"\n"execution"', expectedOutput: '5', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '""\n"a"', expectedOutput: '1' },
      { input: '"zoologico"\n"zoologist"', expectedOutput: '5' },
      { input: '"park"\n"spake"', expectedOutput: '3' }
    ]
  },
  {
    id: 'p-17',
    slug: '3sum',
    title: '3Sum',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Two Pointers', 'Sorting'],
    description: `Given an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets. Return triplets sorted.`,
    inputFormat: 'JSON array of integers.',
    outputFormat: 'JSON 2D array of triplets sorted.',
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ],
    examples: [
      {
        input: '[-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0. Notice duplicates are omitted.'
      },
      {
        input: '[0,1,1]',
        output: '[]'
      },
      {
        input: '[0,0,0]',
        output: '[[0,0,0]]'
      }
    ],
    starterCode: {
      python: `import sys, json

def threeSum(nums):
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l + 1]:
                    l += 1
                while l < r and nums[r] == nums[r - 1]:
                    r -= 1
                l += 1
                r -= 1
    return res

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(json.dumps(threeSum(json.loads(line))))
`,
      javascript: `const fs = require('fs');

function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const res = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = nums.length - 1;
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r];
            if (sum === 0) {
                res.push([nums[i], nums[l], nums[r]]);
                while (l < r && nums[l] === nums[l + 1]) l++;
                while (l < r && nums[r] === nums[r - 1]) r--;
                l++; r--;
            } else if (sum < 0) l++;
            else r--;
        }
    }
    return res;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(JSON.stringify(threeSum(JSON.parse(input))));
`,
      java: `import java.util.*;
public class Solution { public static void main(String[] args) {} }
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 33.1,
    totalSubmissions: 3100,
    totalAccepted: 1026,
    testCases: [
      { id: 't17-1', input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isPublic: true },
      { id: 't17-2', input: '[0,1,1]', expectedOutput: '[]', isPublic: true },
      { id: 't17-3', input: '[0,0,0]', expectedOutput: '[[0,0,0]]', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]' },
      { input: '[-1,0,1]', expectedOutput: '[[-1,0,1]]' }
    ]
  },
  {
    id: 'p-18',
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'EASY',
    tags: ['Arrays', 'Binary Search'],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    inputFormat: 'Line 1: JSON array nums. Line 2: target integer.',
    outputFormat: 'Integer index or -1.',
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    examples: [
      { input: '[-1,0,3,5,9,12]\n9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: '[-1,0,3,5,9,12]\n2', output: '-1', explanation: '2 does not exist in nums so return -1' }
    ],
    starterCode: {
      python: `import sys, json

def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        elif nums[m] < target:
            l = m + 1
        else:
            r = m - 1
    return -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        print(search(json.loads(lines[0]), int(lines[1])))
`,
      javascript: `const fs = require('fs');

function search(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        const m = Math.floor((l + r) / 2);
        if (nums[m] === target) return m;
        if (nums[m] < target) l = m + 1;
        else r = m - 1;
    }
    return -1;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
    console.log(search(JSON.parse(lines[0]), parseInt(lines[1], 10)));
}
`,
      java: `import java.util.*;
public class Solution { public static void main(String[] args) {} }
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    acceptanceRate: 56.7,
    totalSubmissions: 3900,
    totalAccepted: 2211,
    testCases: [
      { id: 't18-1', input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isPublic: true },
      { id: 't18-2', input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[5]\n5', expectedOutput: '0' },
      { input: '[2,5]\n5', expectedOutput: '1' },
      { input: '[2,5]\n0', expectedOutput: '-1' }
    ]
  },
  {
    id: 'p-19',
    slug: 'word-search',
    title: 'Word Search',
    difficulty: 'MEDIUM',
    tags: ['Arrays', 'Backtracking', 'Matrix'],
    description: `Given an \`m x n\` grid of characters \`board\` and a string \`word\`, return \`true\` if \`word\` exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.`,
    inputFormat: 'Line 1: JSON 2D array of chars. Line 2: target string.',
    outputFormat: 'true or false',
    constraints: [
      'm == board.length',
      'n = board[i].length',
      '1 <= m, n <= 6',
      '1 <= word.length <= 15',
      'board and word consists of only lowercase and uppercase English letters.'
    ],
    examples: [
      {
        input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCCED"',
        output: 'true'
      },
      {
        input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"SEE"',
        output: 'true'
      },
      {
        input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCB"',
        output: 'false'
      }
    ],
    starterCode: {
      python: `import sys, json

def exist(board, word):
    m, n = len(board), len(board[0])
    
    def backtrack(r, c, idx):
        if idx == len(word):
            return True
        if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[idx]:
            return False
        temp = board[r][c]
        board[r][c] = '#'
        found = (backtrack(r + 1, c, idx + 1) or
                 backtrack(r - 1, c, idx + 1) or
                 backtrack(r, c + 1, idx + 1) or
                 backtrack(r, c - 1, idx + 1))
        board[r][c] = temp
        return found
        
    for i in range(m):
        for j in range(n):
            if board[i][j] == word[0] and backtrack(i, j, 0):
                return True
    return False

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if len(lines) >= 2:
        board = json.loads(lines[0])
        word = json.loads(lines[1]) if lines[1].startswith('"') else lines[1]
        print(str(exist(board, word)).lower())
`,
      javascript: `const fs = require('fs');

function exist(board, word) {
    const m = board.length, n = board[0].length;
    function backtrack(r, c, idx) {
        if (idx === word.length) return true;
        if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== word[idx]) return false;
        const temp = board[r][c];
        board[r][c] = '#';
        const found = backtrack(r + 1, c, idx + 1) ||
                      backtrack(r - 1, c, idx + 1) ||
                      backtrack(r, c + 1, idx + 1) ||
                      backtrack(r, c - 1, idx + 1);
        board[r][c] = temp;
        return found;
    }
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (board[i][j] === word[0] && backtrack(i, j, 0)) return true;
        }
    }
    return false;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
    const b = JSON.parse(lines[0]);
    const w = lines[1].startsWith('"') ? JSON.parse(lines[1]) : lines[1];
    console.log(exist(b, w));
}
`,
      java: `import java.util.*;
public class Solution { public static void main(String[] args) {} }
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 41.2,
    totalSubmissions: 1980,
    totalAccepted: 815,
    testCases: [
      { id: 't19-1', input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCCED"', expectedOutput: 'true', isPublic: true },
      { id: 't19-2', input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"SEE"', expectedOutput: 'true', isPublic: true },
      { id: 't19-3', input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCB"', expectedOutput: 'false', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '[["a"]]\n"a"', expectedOutput: 'true' },
      { input: '[["a","b"],["c","d"]]\n"abcd"', expectedOutput: 'false' }
    ]
  },
  {
    id: 'p-20',
    slug: 'n-queens',
    title: 'N-Queens',
    difficulty: 'HARD',
    tags: ['Backtracking'],
    description: `The **n-queens** puzzle is the problem of placing \`n\` queens on an \`n x n\` chessboard such that no two queens attack each other.

Given an integer \`n\`, return *the number of distinct solutions* to the **n-queens puzzle**.`,
    inputFormat: 'Integer n representing board dimension.',
    outputFormat: 'Integer number of distinct board configurations.',
    constraints: ['1 <= n <= 12'],
    examples: [
      { input: '4', output: '2', explanation: 'There are two distinct solutions to the 4-queens puzzle.' },
      { input: '1', output: '1' }
    ],
    starterCode: {
      python: `import sys

def totalNQueens(n: int) -> int:
    cols = set()
    pos_diag = set() # (r + c)
    neg_diag = set() # (r - c)
    count = 0
    
    def backtrack(r):
        nonlocal count
        if r == n:
            count += 1
            return
        for c in range(n):
            if c in cols or (r + c) in pos_diag or (r - c) in neg_diag:
                continue
            cols.add(c)
            pos_diag.add(r + c)
            neg_diag.add(r - c)
            
            backtrack(r + 1)
            
            cols.remove(c)
            pos_diag.remove(r + c)
            neg_diag.remove(r - c)
            
    backtrack(0)
    return count

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(totalNQueens(int(line)))
`,
      javascript: `const fs = require('fs');

function totalNQueens(n) {
    const cols = new Set(), pos = new Set(), neg = new Set();
    let count = 0;
    function backtrack(r) {
        if (r === n) { count++; return; }
        for (let c = 0; c < n; c++) {
            if (cols.has(c) || pos.has(r + c) || neg.has(r - c)) continue;
            cols.add(c); pos.add(r + c); neg.add(r - c);
            backtrack(r + 1);
            cols.delete(c); pos.delete(r + c); neg.delete(r - c);
        }
    }
    backtrack(0);
    return count;
}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) console.log(totalNQueens(parseInt(input, 10)));
`,
      java: `import java.util.*;
public class Solution { public static void main(String[] args) {} }
`,
      cpp: `#include <iostream>
using namespace std;
int main() { return 0; }
`
    },
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    acceptanceRate: 68.3,
    totalSubmissions: 2400,
    totalAccepted: 1639,
    testCases: [
      { id: 't20-1', input: '4', expectedOutput: '2', isPublic: true },
      { id: 't20-2', input: '1', expectedOutput: '1', isPublic: true }
    ],
    hiddenTestCases: [
      { input: '2', expectedOutput: '0' },
      { input: '3', expectedOutput: '0' },
      { input: '5', expectedOutput: '10' },
      { input: '6', expectedOutput: '4' },
      { input: '8', expectedOutput: '92' }
    ]
  }
];
