import java.io.*;
import java.util.*;

public class Main {

    static Scanner scanner = new Scanner(System.in);

    static ArrayList<Problem> problems =
            new ArrayList<>();

    static ArrayList<String> submissionHistory =
            new ArrayList<>();

    static User user =
            new User("Student");

    static Judge judge =
            new Judge();

    public static void main(String[] args) {

        loadProblems();

        System.out.println("=================================");
        System.out.println("       ONLINE CODING JUDGE");
        System.out.println("=================================");

        boolean running = true;

        while (running) {

            showMenu();

            System.out.print("Enter choice: ");

            String input = scanner.nextLine();

            int choice;

            try {
                choice = Integer.parseInt(input);
            } catch (NumberFormatException e) {
                System.out.println("\nPlease enter a number.");
                continue;
            }

            switch (choice) {

                case 1:
                    viewProblems();
                    break;

                case 2:
                    viewProblem();
                    break;

                case 3:
                    submitSolution();
                    break;

                case 4:
                    viewSubmissions();
                    break;

                case 5:
                    user.display();
                    break;

                case 6:
                    running = false;
                    System.out.println(
                            "\nThank you for using Online Coding Judge!"
                    );
                    break;

                default:
                    System.out.println(
                            "\nInvalid choice."
                    );
            }
        }

        scanner.close();
    }

    static void showMenu() {

        System.out.println("\n=================================");
        System.out.println("            MAIN MENU");
        System.out.println("=================================");

        System.out.println("1. View Problems");
        System.out.println("2. View Problem Details");
        System.out.println("3. Submit Solution");
        System.out.println("4. View Submissions");
        System.out.println("5. View User");
        System.out.println("6. Exit");

        System.out.println("=================================");
    }

    static void loadProblems() {

        File file =
                new File("problems/problems.txt");

        try {

            BufferedReader reader =
                    new BufferedReader(
                            new FileReader(file)
                    );

            String line;

            while ((line = reader.readLine()) != null) {

                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] data =
                        line.split("\\|", -1);

                if (data.length >= 5) {

                    int id =
                            Integer.parseInt(data[0]);

                    Problem problem =
                            new Problem(
                                    id,
                                    data[1],
                                    data[2],
                                    data[3],
                                    data[4]
                            );

                    problems.add(problem);
                }
            }

            reader.close();

        } catch (Exception e) {

            System.out.println(
                    "Could not load problems."
            );
        }
    }

    static void viewProblems() {

        System.out.println("\n========== PROBLEMS ==========");

        if (problems.isEmpty()) {

            System.out.println(
                    "No problems available."
            );

            return;
        }

        for (Problem problem : problems) {

            System.out.println(
                    problem.id + ". " +
                    problem.title
            );
        }
    }

    static void viewProblem() {

        System.out.print(
                "\nEnter problem ID: "
        );

        int id;

        try {

            id = Integer.parseInt(
                    scanner.nextLine()
            );

        } catch (NumberFormatException e) {

            System.out.println(
                    "Invalid problem ID."
            );

            return;
        }

        Problem problem =
                findProblem(id);

        if (problem == null) {

            System.out.println(
                    "Problem not found."
            );

            return;
        }

        problem.display();
    }

    static void submitSolution() {

        System.out.println(
                "\n========== SUBMIT SOLUTION =========="
        );

        System.out.print(
                "Enter problem ID: "
        );

        int id;

        try {

            id = Integer.parseInt(
                    scanner.nextLine()
            );

        } catch (NumberFormatException e) {

            System.out.println(
                    "Invalid problem ID."
            );

            return;
        }

        Problem problem =
                findProblem(id);

        if (problem == null) {

            System.out.println(
                    "Problem not found."
            );

            return;
        }

        System.out.println(
                "\nSelected Problem: " +
                problem.title
        );

        System.out.println(
                "\nEnter the path of your Java file."
        );

        System.out.println(
                "Example: C:\\Users\\VARTIKA TOMAR\\Desktop\\Solution.java"
        );

        System.out.print(
                "\nJava file path: "
        );

        String path =
                scanner.nextLine().trim();

        // Remove quotes if user pasted a quoted path
        if (path.startsWith("\"") &&
                path.endsWith("\"")) {

            path =
                    path.substring(
                            1,
                            path.length() - 1
                    );
        }

        File file =
                new File(path);

        if (!file.exists()) {

            System.out.println(
                    "\nFile does not exist."
            );

            return;
        }

        if (!file.getName().endsWith(".java")) {

            System.out.println(
                    "\nPlease submit a .java file."
            );

            return;
        }

        System.out.println(
                "\nJudging your solution..."
        );

        String result =
                judge.judge(
                        path,
                        problem
                );

        user.addSubmission();

        String record =
                "Problem " +
                problem.id +
                " - " +
                problem.title +
                " -> " +
                result;

        submissionHistory.add(record);

        System.out.println(
                "\n================================="
        );

        System.out.println(
                "             VERDICT"
        );

        System.out.println(
                "================================="
        );

        System.out.println(result);

        System.out.println(
                "================================="
        );
    }

    static void viewSubmissions() {

        System.out.println(
                "\n========== SUBMISSIONS =========="
        );

        if (submissionHistory.isEmpty()) {

            System.out.println(
                    "No submissions yet."
            );

            return;
        }

        for (int i = 0;
             i < submissionHistory.size();
             i++) {

            System.out.println(
                    (i + 1) +
                    ". " +
                    submissionHistory.get(i)
            );
        }
    }

    static Problem findProblem(int id) {

        for (Problem problem : problems) {

            if (problem.id == id) {
                return problem;
            }
        }

        return null;
    }
}