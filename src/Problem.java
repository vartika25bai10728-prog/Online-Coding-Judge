public class Problem {

    int id;
    String title;
    String description;
    String input;
    String expectedOutput;

    public Problem(int id, String title, String description,
                   String input, String expectedOutput) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.input = input;
        this.expectedOutput = expectedOutput;
    }

    public void display() {

        System.out.println("\n-------------------------------");
        System.out.println("Problem " + id + ": " + title);
        System.out.println("-------------------------------");
        System.out.println(description);
        System.out.println("\nInput:");
        System.out.println(input);
        System.out.println("\nExpected Output:");
        System.out.println(expectedOutput);
    }
}