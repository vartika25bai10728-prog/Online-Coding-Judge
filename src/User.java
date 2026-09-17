public class User {

    String username;
    int submissionCount;

    public User(String username) {
        this.username = username;
        this.submissionCount = 0;
    }

    public void addSubmission() {
        submissionCount++;
    }

    public void display() {

        System.out.println("\n========== USER ==========");
        System.out.println("Username: " + username);
        System.out.println("Submissions: " + submissionCount);
    }
}