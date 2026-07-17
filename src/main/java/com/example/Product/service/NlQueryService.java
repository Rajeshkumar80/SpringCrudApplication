package com.example.Product.service;

import com.example.Product.dto.AiQueryResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Feature 1 — AI Chat with Database (NL → SQL → Execute → AI Explanation)
 *
 * Workflow:
 *   1. User asks a natural language question.
 *   2. AI generates a safe SELECT SQL query from the question.
 *   3. We execute the SQL against the products table.
 *   4. AI explains the results in plain English.
 */
@Service
public class NlQueryService {

    private final ChatClient chatClient;
    private final EntityManager entityManager;

    public NlQueryService(ChatClient.Builder builder, EntityManager entityManager) {
        this.chatClient = builder.build();
        this.entityManager = entityManager;
    }

    // ==============================
    // Main entry point
    // ==============================
    public AiQueryResponse query(String userQuestion) {
        AiQueryResponse response = new AiQueryResponse();
        response.setQuestion(userQuestion);

        try {
            // Step 1: Generate SQL from natural language
            String sql = generateSql(userQuestion);

            // Step 2: Safety check — only SELECT allowed
            if (!isSafeQuery(sql)) {
                response.setSuccess(false);
                response.setErrorMessage("Only read queries are supported.");
                return response;
            }

            // Step 3: Execute SQL
            List<Map<String, Object>> rows = executeQuery(sql);

            // Step 4: AI explains results
            String explanation = explainResults(userQuestion, rows);

            response.setResults(rows);
            response.setResultCount(rows.size());
            response.setAiExplanation(explanation);
            response.setSuccess(true);

        } catch (Exception e) {
            response.setSuccess(false);
            response.setErrorMessage("Could not process your query. Try rephrasing it.");
            response.setAiExplanation("I encountered an issue processing your question. " +
                    "Try asking something like: 'Show Samsung phones under ₹50,000' or " +
                    "'Which phone has the best rating?'");
        }

        return response;
    }

    // ==============================
    // Step 1: Generate SQL using LLM
    // ==============================
    private String generateSql(String question) {
        String prompt = """
                You are a SQL expert. Convert the user's natural language question into a valid MySQL SELECT query.
                
                DATABASE TABLE: products
                COLUMNS:
                  id          BIGINT       - unique product ID
                  name        VARCHAR      - product name (e.g. "iPhone 16", "Galaxy S25")
                  brand       VARCHAR      - brand name (e.g. "Apple", "Samsung", "OnePlus")
                  price       DOUBLE       - price in Indian Rupees (e.g. 79999)
                  processor   VARCHAR      - chip name (e.g. "Snapdragon 8 Elite", "Apple A18")
                  ram         VARCHAR      - RAM (e.g. "8GB", "12GB", "16GB")
                  storage     VARCHAR      - storage (e.g. "128GB", "256GB", "512GB")
                  battery     VARCHAR      - battery (e.g. "5000mAh", "6000mAh")
                  camera      VARCHAR      - camera (e.g. "50MP + 12MP", "200MP")
                  display_info VARCHAR     - display (e.g. "6.7\" AMOLED 120Hz")
                  rating      DOUBLE       - user rating 1.0 to 5.0
                  stock       INT          - units in stock
                  image_url   VARCHAR      - image URL (ignore in queries)
                
                RULES:
                - ONLY generate SELECT queries. Never INSERT, UPDATE, DELETE, DROP, ALTER.
                - Always SELECT: id, name, brand, price, processor, ram, storage, battery, camera, display_info, rating, stock
                - Use LIKE '%...%' for text searches (case-insensitive with LOWER())
                - For price queries, compare against the price column numerically
                - For "gaming phones" use: LOWER(processor) LIKE '%snapdragon%' OR LOWER(processor) LIKE '%dimensity%'
                - For "AMOLED" use: LOWER(display_info) LIKE '%amoled%'
                - For "budget" phones assume price < 30000
                - For "flagship" phones assume price > 75000
                - For "best rated" use ORDER BY rating DESC
                - Limit results to 10 unless user asks for more
                - Return ONLY the raw SQL query — no markdown, no explanation, no backticks
                
                USER QUESTION: """ + question + """
                
                SQL QUERY:""";

        String sql = chatClient.prompt().user(prompt).call().content();
        return cleanSql(sql);
    }

    // ==============================
    // Step 2: Safety check
    // ==============================
    private boolean isSafeQuery(String sql) {
        if (sql == null || sql.isBlank()) return false;
        String upper = sql.toUpperCase().trim();
        if (!upper.startsWith("SELECT")) return false;
        // Reject any destructive keywords
        String[] forbidden = {"INSERT", "UPDATE", "DELETE", "DROP", "ALTER",
                "CREATE", "TRUNCATE", "EXEC", "EXECUTE", "--", ";"};
        for (String kw : forbidden) {
            if (upper.contains(kw) && !upper.startsWith("SELECT")) return false;
        }
        // Allow only one statement (no semicolon mid-query)
        long semicolons = sql.chars().filter(c -> c == ';').count();
        return semicolons <= 1;
    }

    // ==============================
    // Step 3: Execute native SQL
    // ==============================
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> executeQuery(String sql) {
        // Strip trailing semicolon if present
        String cleanedSql = sql.trim().replaceAll(";$", "");

        Query nativeQuery = entityManager.createNativeQuery(cleanedSql);
        List<Object[]> rawRows = nativeQuery.getResultList();

        // Column names for products SELECT *
        String[] cols = {"id", "battery", "brand", "camera", "display",
                "image_url", "name", "price", "processor", "ram",
                "rating", "stock", "storage"};

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rawRows) {
            Map<String, Object> map = new LinkedHashMap<>();
            for (int i = 0; i < row.length && i < cols.length; i++) {
                map.put(cols[i], row[i]);
            }
            result.add(map);
        }
        return result;
    }

    // ==============================
    // Step 4: AI explains results
    // ==============================
    private String explainResults(String question, List<Map<String, Object>> rows) {
        if (rows.isEmpty()) {
            return "No products found matching your query. Try searching with different criteria, " +
                    "such as a different budget range, brand, or feature.";
        }

        StringBuilder context = new StringBuilder();
        int limit = Math.min(rows.size(), 8);
        for (int i = 0; i < limit; i++) {
            Map<String, Object> row = rows.get(i);
            context.append(i + 1).append(". ")
                    .append(row.getOrDefault("name", "")).append(" (")
                    .append(row.getOrDefault("brand", "")).append(") — ₹")
                    .append(row.getOrDefault("price", "")).append(", ")
                    .append("Rating: ").append(row.getOrDefault("rating", "")).append("/5, ")
                    .append("RAM: ").append(row.getOrDefault("ram", "")).append(", ")
                    .append("Battery: ").append(row.getOrDefault("battery", "")).append("\n");
        }

        String prompt = "User asked: \"" + question + "\"\n\n" +
                "The database returned " + rows.size() + " products:\n" + context +
                "\nWrite a brief, professional 2-3 sentence explanation of these results. " +
                "Mention the key highlights (best value, top rating, notable specs). " +
                "Be direct and helpful. Do not repeat all the data — just explain what's notable.";

        try {
            return chatClient.prompt().user(prompt).call().content();
        } catch (Exception e) {
            return "Found " + rows.size() + " products matching your query.";
        }
    }

    // ==============================
    // Clean LLM output to pure SQL
    // ==============================
    private String cleanSql(String raw) {
        if (raw == null) return "";
        // Remove markdown code blocks
        String cleaned = raw.replaceAll("```sql", "").replaceAll("```", "").trim();
        // Take only first line if multiple lines returned
        String[] lines = cleaned.split("\n");
        StringBuilder sql = new StringBuilder();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                sql.append(trimmed).append(" ");
            }
        }
        return sql.toString().trim();
    }
}
