package com.apex.judge.repository;

import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Repository
public class SystemStatsJdbcRepository {

    private final DataSource dataSource;

    public SystemStatsJdbcRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public static class PlatformStatistics {
        private final long totalSubmissions;
        private final long acceptedSubmissions;
        private final double avgRuntimeMs;
        private final long activeCoders;
        private final Map<String, Long> languageBreakdown;

        public PlatformStatistics(long totalSubmissions, long acceptedSubmissions, double avgRuntimeMs, long activeCoders, Map<String, Long> languageBreakdown) {
            this.totalSubmissions = totalSubmissions;
            this.acceptedSubmissions = acceptedSubmissions;
            this.avgRuntimeMs = avgRuntimeMs;
            this.activeCoders = activeCoders;
            this.languageBreakdown = languageBreakdown;
        }

        public long getTotalSubmissions() { return totalSubmissions; }
        public long getAcceptedSubmissions() { return acceptedSubmissions; }
        public double getAvgRuntimeMs() { return avgRuntimeMs; }
        public long getActiveCoders() { return activeCoders; }
        public Map<String, Long> getLanguageBreakdown() { return languageBreakdown; }
    }

    public PlatformStatistics fetchAggregatedStatistics() throws SQLException {
        String aggregateSql = """
            SELECT 
                COUNT(*) AS total_count,
                COUNT(CASE WHEN verdict = 'ACCEPTED' THEN 1 END) AS accepted_count,
                COALESCE(AVG(CASE WHEN verdict = 'ACCEPTED' THEN runtime_ms END), 0.0) AS avg_runtime,
                COUNT(DISTINCT user_id) AS coder_count
            FROM submissions
        """;

        String languageSql = """
            SELECT language, COUNT(*) AS lang_count
            FROM submissions
            GROUP BY language
            ORDER BY lang_count DESC
        """;

        long total = 0;
        long accepted = 0;
        double avgRuntime = 0.0;
        long activeCoders = 0;
        Map<String, Long> languages = new HashMap<>();

        // Raw JDBC Connection, PreparedStatement, and ResultSet with try-with-resources
        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement statement = connection.prepareStatement(aggregateSql);
                 ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    total = resultSet.getLong("total_count");
                    accepted = resultSet.getLong("accepted_count");
                    avgRuntime = resultSet.getDouble("avg_runtime");
                    activeCoders = resultSet.getLong("coder_count");
                }
            }

            try (PreparedStatement statement = connection.prepareStatement(languageSql);
                 ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    String lang = resultSet.getString("language");
                    long count = resultSet.getLong("lang_count");
                    languages.put(lang, count);
                }
            }
        }

        return new PlatformStatistics(total, accepted, avgRuntime, activeCoders, languages);
    }
}
