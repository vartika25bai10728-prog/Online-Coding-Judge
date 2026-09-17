# Online Coding Judge

A simple **terminal-based Online Coding Judge built entirely with Java**.

The project allows users to view programming problems, submit Java solutions, compile and execute those solutions, compare the output with the expected output, and receive a verdict.

## Features

* View available programming problems
* View detailed problem information
* Submit Java source files
* Automatically compile submitted solutions
* Execute submitted programs with test input
* Compare program output with expected output
* Display different verdicts:

  * Accepted
  * Wrong Answer
  * Compilation Error
  * Runtime Error
  * Time Limit Exceeded
* View submission history
* Track the number of submissions
* Simple terminal-based interface
* No external database or framework required

## Technologies Used

* Java
* Java `Scanner`
* Java File I/O
* Java `ProcessBuilder`
* ArrayList
* Object-Oriented Programming

## Project Structure

```text
Online-Coding-Judge/
│
├── src/
│   ├── Main.java
│   ├── Problem.java
│   ├── User.java
│   └── Judge.java
│
├── problems/
│   └── problems.txt
│
├── submissions/
│
└── README.md
```

## How It Works

The application follows this basic workflow:

```text
User
  |
  v
Main.java
  |
  +---- View Problems
  |
  +---- View Problem Details
  |
  +---- Submit Solution
              |
              v
          Judge.java
              |
        +-----+-----+
        |           |
     Compile      Execute
        |           |
        +-----+-----+
              |
              v
       Compare Output
              |
              v
           Verdict
```

## Problem Format

Problems are stored in:

```text
problems/problems.txt
```

Each problem uses the following format:

```text
ID|Title|Description|Input|Expected Output
```

Example:

```text
1|Add Two Numbers|Read two integers and print their sum.|5 3|8
```

## Running the Project

### 1. Open the project directory

```powershell
cd "C:\Users\VARTIKA TOMAR\Desktop\Vityarthi JAVA\online-judge"
```

### 2. Compile the Java files

```powershell
javac src\*.java
```

### 3. Run the application

```powershell
java -cp src Main
```

## Main Menu

The application provides the following options:

```text
=================================
            MAIN MENU
=================================
1. View Problems
2. View Problem Details
3. Submit Solution
4. View Submissions
5. View User
6. Exit
=================================
```

## Submitting a Solution

The judge accepts a Java source file.

For example:

```java
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);

        int a = scanner.nextInt();
        int b = scanner.nextInt();

        System.out.println(a + b);
    }
}
```

When submitting, provide the path to the Java file:

```text
C:\Users\VARTIKA TOMAR\Desktop\Solution.java
```

The judge then:

1. Reads the submitted Java file.
2. Compiles the program.
3. Runs the compiled program.
4. Provides the problem's test input.
5. Captures the program's output.
6. Compares it with the expected output.
7. Displays the final verdict.

## Verdicts

### Accepted

The submitted program produces the expected output.

### Wrong Answer

The program runs successfully, but its output does not match the expected output.

### Compilation Error

The submitted Java program contains compilation errors.

### Runtime Error

The program compiles but encounters an error while running.

### Time Limit Exceeded

The program does not finish execution within the allowed time.

## Example

For the problem:

```text
Input:
5 3

Expected Output:
8
```

A correct submission produces:

```text
Your Output:
8

Expected Output:
8

VERDICT
Accepted
```

## Classes

### Main.java

Controls the application and displays the terminal menu.

Responsibilities:

* Start the application
* Load problems
* Display the menu
* Handle user choices
* Submit solutions
* Display submission history

### Problem.java

Represents a programming problem.

Stores:

* Problem ID
* Title
* Description
* Input
* Expected output

### User.java

Represents the user of the judge.

Stores:

* Username
* Number of submissions

### Judge.java

Responsible for evaluating submitted Java programs.

It:

* Compiles the submitted source code
* Executes the program
* Provides test input
* Captures output
* Compares the result
* Generates a verdict

## Concepts Demonstrated

This project demonstrates several core Java concepts:

* Classes and objects
* Constructors
* Methods
* `ArrayList`
* `Scanner`
* File handling
* Exception handling
* Loops
* Conditional statements
* `switch`
* String manipulation
* `ProcessBuilder`
* Object-oriented programming

## Future Improvements

Possible future improvements include:

* Multiple test cases per problem
* Support for additional programming languages
* Persistent submission history
* User accounts
* Problem creation
* Difficulty levels
* Score calculation
* Contest mode
* Improved code execution sandboxing
* A graphical or web interface

