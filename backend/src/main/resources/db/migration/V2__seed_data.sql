-- Flyway V2: Seed Data for Apex Coding Judge
-- Passwords are BCrypt hash of 'password123' ($2a$10$7rGg9vF04X3sQp9kFz4tE.9lE5yZqE5F0e4qE5F0e4qE5F0e4qE5F)

INSERT INTO users (id, username, email, password, role, avatar, rating, solved_count, current_streak, bio)
VALUES 
    ('u-1', 'admin', 'admin@apexjudge.io', '$2a$10$WpA1qL41sU69Wl5J7x9eheZ4yD3o0Gj1xG8Z1Qp0t5w1w0v0v0v0v', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 2450, 42, 14, 'Apex Judge Lead Platform Administrator & System Architect.'),
    ('u-2', 'alex_coder', 'alex@example.com', '$2a$10$WpA1qL41sU69Wl5J7x9eheZ4yD3o0Gj1xG8Z1Qp0t5w1w0v0v0v0v', 'USER', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 1845, 18, 5, 'Competitive programmer and full-stack software engineer focusing on graph algorithms.');

INSERT INTO problems (id, slug, title, difficulty, tags, description, input_format, output_format, constraints, time_limit_ms, memory_limit_mb, acceptance_rate, total_submissions, total_accepted, starter_python, starter_javascript, starter_java, starter_cpp)
VALUES 
(
    'p-1',
    'two-sum',
    'Two Sum',
    'EASY',
    'Arrays, Hashing',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    'Line 1: JSON array of numbers nums. Line 2: target integer.',
    'JSON array containing the two indices [i, j].',
    '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    1500,
    256,
    51.2,
    3120,
    1598,
    'import sys, json\n\ndef twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nif __name__ == "__main__":\n    lines = sys.stdin.read().strip().splitlines()\n    if len(lines) >= 2:\n        nums = json.loads(lines[0])\n        target = int(lines[1])\n        print(json.dumps(twoSum(nums, target)))\n',
    'const fs = require("fs");\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) return [map.get(complement), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\nconst input = fs.readFileSync(0, "utf-8").trim().split("\\n");\nif (input.length >= 2) {\n    console.log(JSON.stringify(twoSum(JSON.parse(input[0]), parseInt(input[1], 10))));\n}\n',
    'import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String line1 = sc.nextLine().replaceAll("[\\[\\]\\\\s]", "");\n            String[] parts = line1.split(",");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            int target = Integer.parseInt(sc.nextLine().trim());\n            int[] res = twoSum(nums, target);\n            System.out.println(Arrays.toString(res).replaceAll(" ", ""));\n        }\n    }\n}\n',
    '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() { return 0; }\n'
),
(
    'p-2',
    'valid-parentheses',
    'Valid Parentheses',
    'EASY',
    'Stack, String',
    'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    'Single line containing the string s.',
    'true or false',
    '1 <= s.length <= 10^4\ns consists of parentheses only "()[]{}"',
    1000,
    128,
    42.8,
    4500,
    1926,
    'import sys\ndef isValid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print("true" if isValid(s) else "false")\n',
    'const fs = require("fs");\nfunction isValid(s) {\n    const stack = [];\n    const map = { ")": "(", "}": "{", "]": "[" };\n    for (let char of s) {\n        if (map[char]) {\n            if (stack.pop() !== map[char]) return false;\n        } else stack.push(char);\n    }\n    return stack.length === 0;\n}\nconst s = fs.readFileSync(0, "utf-8").trim();\nconsole.log(isValid(s) ? "true" : "false");\n',
    'import java.util.*;\npublic class Solution {\n    public static boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == "(") stack.push(")");\n            else if (c == "{") stack.push("}");\n            else if (c == "[") stack.push("]");\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) System.out.println(isValid(sc.nextLine().trim()));\n    }\n}\n',
    '#include <iostream>\nusing namespace std;\nint main() { return 0; }\n'
);

INSERT INTO test_cases (id, problem_id, input, expected_output, is_public, weight)
VALUES 
    ('tc-1-1', 'p-1', '[2,7,11,15]\n9', '[0,1]', true, 1),
    ('tc-1-2', 'p-1', '[3,2,4]\n6', '[1,2]', true, 1),
    ('tc-1-3', 'p-1', '[3,3]\n6', '[0,1]', true, 1),
    ('tc-1-4', 'p-1', '[1,5,8,12,20]\n28', '[2,4]', false, 2),
    ('tc-2-1', 'p-2', '()', 'true', true, 1),
    ('tc-2-2', 'p-2', '()[]{}', 'true', true, 1),
    ('tc-2-3', 'p-2', '(]', 'false', true, 1),
    ('tc-2-4', 'p-2', '([)]', 'false', false, 2);

INSERT INTO contests (id, title, description, start_time, end_time, duration_minutes, status, participants_count)
VALUES 
    ('c-1', 'Weekly Algorithmic Sprint 104', 'Bi-weekly algorithmic contest featuring 4 problems with standard ICPC penalty scoring.', CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP + INTERVAL '90 minutes', 120, 'LIVE', 482),
    ('c-2', 'Grand ICPC Invitational 2026', 'Elite division competitive round with strict memory & CPU resource sandbox execution.', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days 3 hours', 180, 'UPCOMING', 1240);
