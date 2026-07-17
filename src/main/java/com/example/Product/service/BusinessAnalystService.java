package com.example.Product.service;

import com.example.Product.dto.BusinessInsightResponse;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Feature 2 — AI Business Analyst
 *
 * Analyzes the full product inventory and generates:
 *   - Executive summary
 *   - Key business insights
 *   - Actionable recommendations
 *   - Risk flags
 *   - Overall business health
 */
@Service
public class BusinessAnalystService {

    private final ChatClient chatClient;
    private final ProductRepository productRepository;

    public BusinessAnalystService(ChatClient.Builder builder,
                                   ProductRepository productRepository) {
        this.chatClient = builder.build();
        this.productRepository = productRepository;
    }

    // ==============================
    // Generate full business analysis
    // ==============================
    public BusinessInsightResponse analyze() {
        List<Product> products = productRepository.findAll();
        String dataContext = buildDataContext(products);

        String prompt = """
                You are a senior business analyst and inventory consultant.
                Analyze the following product inventory data and provide professional insights.
                
                INVENTORY DATA:
                """ + dataContext + """
                
                Provide a structured analysis in EXACTLY this format (keep each section concise):
                
                SUMMARY: [2-3 sentence executive summary of the overall business state]
                
                INSIGHT: [specific data-backed observation about brands/pricing]
                INSIGHT: [specific data-backed observation about stock levels]
                INSIGHT: [specific data-backed observation about ratings/quality]
                INSIGHT: [specific data-backed observation about inventory value distribution]
                INSIGHT: [specific data-backed observation about pricing trends]
                
                RECOMMENDATION: [specific actionable recommendation with product name]
                RECOMMENDATION: [specific actionable recommendation about stock management]
                RECOMMENDATION: [specific actionable recommendation about pricing strategy]
                
                RISK: [specific risk about low stock or overstocked items]
                RISK: [specific risk about pricing or market position]
                
                HEALTH: [Excellent / Good / Fair / Poor] - [one sentence reason]
                
                Be specific with numbers and product names. Sound like a professional consultant.
                """;

        BusinessInsightResponse response = new BusinessInsightResponse();

        try {
            String aiOutput = chatClient.prompt().user(prompt).call().content();
            parseAiOutput(aiOutput, response, products);
            response.setSuccess(true);
        } catch (Exception e) {
            response.setSuccess(false);
            // Fallback: generate rule-based insights
            generateFallbackInsights(response, products);
        }

        return response;
    }

    // ==============================
    // Build data context for AI
    // ==============================
    private String buildDataContext(List<Product> products) {
        // Aggregate stats
        long total = products.size();
        double avgPrice = products.stream().mapToDouble(Product::getPrice).average().orElse(0);
        double totalValue = products.stream().mapToDouble(p -> p.getPrice() * p.getStock()).sum();
        long totalStock = products.stream().mapToLong(Product::getStock).sum();
        long lowStock = products.stream().filter(p -> p.getStock() <= 5).count();
        double avgRating = products.stream().mapToDouble(Product::getRating).average().orElse(0);

        // Brand breakdown
        Map<String, Long> brandCount = products.stream()
                .collect(Collectors.groupingBy(Product::getBrand, Collectors.counting()));
        Map<String, Double> brandValue = products.stream()
                .collect(Collectors.groupingBy(Product::getBrand,
                        Collectors.summingDouble(p -> p.getPrice() * p.getStock())));

        // Top 5 by value
        List<Product> topByValue = products.stream()
                .sorted(Comparator.comparingDouble((Product p) -> p.getPrice() * p.getStock()).reversed())
                .limit(5).collect(Collectors.toList());

        // Low stock products
        List<Product> lowStockProducts = products.stream()
                .filter(p -> p.getStock() <= 5)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("OVERALL STATS:\n");
        sb.append("- Total Products: ").append(total).append("\n");
        sb.append("- Total Units in Stock: ").append(totalStock).append("\n");
        sb.append("- Total Inventory Value: ₹").append(String.format("%.0f", totalValue)).append("\n");
        sb.append("- Average Price: ₹").append(String.format("%.0f", avgPrice)).append("\n");
        sb.append("- Average Rating: ").append(String.format("%.2f", avgRating)).append("/5\n");
        sb.append("- Products with Low Stock (≤5 units): ").append(lowStock).append("\n\n");

        sb.append("BRAND BREAKDOWN:\n");
        brandCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .forEach(e -> {
                    double bv = brandValue.getOrDefault(e.getKey(), 0.0);
                    double pct = total > 0 ? (e.getValue() * 100.0 / total) : 0;
                    sb.append("- ").append(e.getKey())
                            .append(": ").append(e.getValue()).append(" products (")
                            .append(String.format("%.0f", pct)).append("%), ")
                            .append("Inventory Value: ₹").append(String.format("%.0f", bv)).append("\n");
                });

        sb.append("\nTOP 5 PRODUCTS BY INVENTORY VALUE:\n");
        topByValue.forEach(p -> sb.append("- ").append(p.getName())
                .append(" (").append(p.getBrand()).append(") ₹")
                .append((long) p.getPrice()).append(" × ")
                .append(p.getStock()).append(" units\n"));

        if (!lowStockProducts.isEmpty()) {
            sb.append("\nLOW STOCK ALERT (≤5 units):\n");
            lowStockProducts.forEach(p -> sb.append("- ").append(p.getName())
                    .append(": ").append(p.getStock()).append(" units remaining\n"));
        }

        // Price range breakdown
        long budget = products.stream().filter(p -> p.getPrice() < 30000).count();
        long mid = products.stream().filter(p -> p.getPrice() >= 30000 && p.getPrice() < 70000).count();
        long premium = products.stream().filter(p -> p.getPrice() >= 70000).count();
        sb.append("\nPRICE SEGMENTS:\n");
        sb.append("- Budget (< ₹30K): ").append(budget).append(" products\n");
        sb.append("- Mid-range (₹30K–₹70K): ").append(mid).append(" products\n");
        sb.append("- Premium (> ₹70K): ").append(premium).append(" products\n");

        return sb.toString();
    }

    // ==============================
    // Parse AI structured output
    // ==============================
    private void parseAiOutput(String aiOutput, BusinessInsightResponse response,
                                 List<Product> products) {
        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> risks = new ArrayList<>();
        String summary = "";
        String health = "Good";

        for (String line : aiOutput.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("SUMMARY:")) {
                summary = trimmed.substring(8).trim();
            } else if (trimmed.startsWith("INSIGHT:")) {
                insights.add(trimmed.substring(8).trim());
            } else if (trimmed.startsWith("RECOMMENDATION:")) {
                recommendations.add(trimmed.substring(15).trim());
            } else if (trimmed.startsWith("RISK:")) {
                risks.add(trimmed.substring(5).trim());
            } else if (trimmed.startsWith("HEALTH:")) {
                health = trimmed.substring(7).trim();
            }
        }

        if (summary.isEmpty()) summary = "Inventory analysis complete. " + products.size() + " products analyzed.";
        if (insights.isEmpty()) generateFallbackInsights(response, products);

        response.setSummary(summary);
        response.setInsights(insights);
        response.setRecommendations(recommendations);
        response.setRisks(risks);
        response.setOverallHealth(health);
        response.setConfidenceScore(0.87);
    }

    // ==============================
    // Fallback rule-based insights
    // ==============================
    private void generateFallbackInsights(BusinessInsightResponse response,
                                           List<Product> products) {
        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> risks = new ArrayList<>();

        // Brand counts
        Map<String, Long> brandCount = products.stream()
                .collect(Collectors.groupingBy(Product::getBrand, Collectors.counting()));
        brandCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(e -> insights.add(e.getKey() + " leads with " + e.getValue()
                        + " products (" + String.format("%.0f", e.getValue() * 100.0 / products.size())
                        + "% of catalog)."));

        // Avg price
        double avg = products.stream().mapToDouble(Product::getPrice).average().orElse(0);
        insights.add("Average product price is ₹" + String.format("%.0f", avg) + ".");

        // Low stock
        List<Product> low = products.stream().filter(p -> p.getStock() <= 5).collect(Collectors.toList());
        if (!low.isEmpty()) {
            insights.add(low.size() + " products are critically low in stock.");
            low.forEach(p -> recommendations.add("Restock " + p.getName()
                    + " immediately — only " + p.getStock() + " units remaining."));
            risks.add(low.size() + " products risk going out of stock within days.");
        }

        // Avg rating
        double avgRating = products.stream().mapToDouble(Product::getRating).average().orElse(0);
        insights.add("Average customer rating is " + String.format("%.2f", avgRating) + "/5.");

        // Inventory value
        double totalValue = products.stream().mapToDouble(p -> p.getPrice() * p.getStock()).sum();
        insights.add("Total inventory value is ₹" + String.format("%.0f", totalValue) + ".");

        if (recommendations.isEmpty()) {
            recommendations.add("Review pricing strategy for mid-range segment (₹30K–₹70K).");
        }

        response.setSummary("Inventory analysis shows " + products.size()
                + " products with ₹" + String.format("%.0f", totalValue)
                + " total value. " + low.size() + " products require immediate attention.");
        response.setInsights(insights);
        response.setRecommendations(recommendations);
        response.setRisks(risks);
        response.setOverallHealth(low.size() > 3 ? "Fair" : "Good");
        response.setConfidenceScore(0.75);
        response.setSuccess(true);
    }
}
