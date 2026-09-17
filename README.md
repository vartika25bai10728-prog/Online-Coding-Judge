# Apex Online Judge (Terminal Edition)

A simple terminal-based coding judge made for my first year college mini-project.

## About The Project

This is a terminal website where students can practice basic coding problems like Two Sum, Palindrome Number, Valid Parentheses, Reverse String, and more. 

Instead of heavy frontend or fancy buttons, everything works through terminal commands.

## Features

- Terminal shell interface with command prompt (`student@judge:~$ `)
- Problem viewer (`view <id>` or `cat <id>`)
- In-terminal code editor (`solve <id>`)
- Multi-language support: Python 3, JavaScript, C++, and Java
- Test case evaluation and runtime measurement
- Submissions log and student leaderboard
- Command history using Up/Down arrow keys

## Commands

- `help` : Show list of all available commands
- `problems` or `ls` : List all problems
- `view <id>` : View a problem description and testcases
- `solve <id>` : Open code editor for a problem
- `run` : Run code with test cases
- `submit` : Submit solution for evaluation
- `submissions` : View submission history
- `leaderboard` : View rankings
- `clear` : Clear terminal screen
- `about` : Project information

## How to Run

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the project:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.
