import java.io.*;
import java.util.concurrent.TimeUnit;

public class Judge {

    public String judge(String sourceFile, Problem problem) {

        File source = new File(sourceFile);

        if (!source.exists()) {
            return "File Not Found";
        }

        File submissionsFolder = new File("submissions");

        if (!submissionsFolder.exists()) {
            submissionsFolder.mkdir();
        }

        File tempSource = new File(
                submissionsFolder,
                "Main.java"
        );

        File tempClass = new File(
                submissionsFolder,
                "Main.class"
        );

        try {

            copyFile(source, tempSource);

            // Compile submitted program
            Process compileProcess = new ProcessBuilder(
                    "javac",
                    tempSource.getAbsolutePath()
            )
                    .redirectErrorStream(true)
                    .start();

            String compileOutput = readOutput(compileProcess);

            compileProcess.waitFor();

            if (compileProcess.exitValue() != 0) {

                System.out.println("\nCompilation Error:");
                System.out.println(compileOutput);

                return "Compilation Error";
            }

            // Run submitted program
            Process runProcess = new ProcessBuilder(
                    "java",
                    "-cp",
                    submissionsFolder.getAbsolutePath(),
                    "Main"
            )
                    .redirectErrorStream(true)
                    .start();

            // Send input to program
            BufferedWriter writer =
                    new BufferedWriter(
                            new OutputStreamWriter(
                                    runProcess.getOutputStream()
                            )
                    );

            writer.write(problem.input);
            writer.newLine();
            writer.flush();
            writer.close();

            boolean finished =
                    runProcess.waitFor(5, TimeUnit.SECONDS);

            if (!finished) {

                runProcess.destroyForcibly();

                return "Time Limit Exceeded";
            }

            String output = readOutput(runProcess);

            if (runProcess.exitValue() != 0) {

                System.out.println("\nRuntime Error:");
                System.out.println(output);

                return "Runtime Error";
            }

            output = output.trim();

            String expected = problem.expectedOutput.trim();

            System.out.println("\nYour Output:");
            System.out.println(output);

            System.out.println("\nExpected Output:");
            System.out.println(expected);

            if (output.equals(expected)) {
                return "Accepted";
            }

            return "Wrong Answer";

        } catch (Exception e) {

            return "Judge Error: " + e.getMessage();

        } finally {

            if (tempSource.exists()) {
                tempSource.delete();
            }

            if (tempClass.exists()) {
                tempClass.delete();
            }
        }
    }

    private void copyFile(File source, File destination)
            throws IOException {

        BufferedReader reader =
                new BufferedReader(
                        new FileReader(source)
                );

        BufferedWriter writer =
                new BufferedWriter(
                        new FileWriter(destination)
                );

        String line;

        while ((line = reader.readLine()) != null) {

            writer.write(line);
            writer.newLine();
        }

        reader.close();
        writer.close();
    }

    private String readOutput(Process process)
            throws IOException {

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                process.getInputStream()
                        )
                );

        StringBuilder output = new StringBuilder();

        String line;

        while ((line = reader.readLine()) != null) {

            output.append(line);
            output.append("\n");
        }

        return output.toString();
    }
}