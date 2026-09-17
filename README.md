# Online Coding Judge (Terminal Edition)

A terminal-based online coding judge built as a 1st year college mini-project for students to practice coding problems.

## What is this?
A simple web terminal that runs in the browser. You type commands to browse problems, write code, run test cases, and submit solutions without any bloated UI.

## Features
- Interactive terminal command prompt (`student@judge:~$ `)
- In-terminal editor buffer to write code
- Supports Python, JavaScript, C++, and Java
- Test case checking with pass/fail verdicts and runtimes (ms)
- Submission history log and student leaderboard
- Up / Down arrow key command history

## Terminal Commands
| Command | What it does |
|---|---|
| `help` | List all available commands |
| `problems` | List all practice problems |
| `view <id>` | View problem details and sample testcases (e.g. `view 1`) |
| `solve <id>` | Open editor for a problem (e.g. `solve 1`) |
| `run` | Run test cases against your code |
| `submit` | Submit code and get verdict (ACCEPTED / WRONG ANSWER) |
| `submissions` | View recent submissions log |
| `leaderboard` | Show top students |
| `clear` | Clear terminal screen |
| `about` | Show project info |

## Practice Problems Included
1. Two Sum (Easy)
2. Palindrome Number (Easy)
3. Valid Parentheses (Easy)
4. Reverse String (Easy)
5. Contains Duplicate (Easy)
6. Fizz Buzz (Easy)
7. Binary Search (Easy)
8. Maximum Subarray (Medium)

## How to Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
