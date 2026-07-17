package com.example.Product.service;

import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Feature 3 — AI Product Consultant
 *
 * Behaves like an intelligent shopping advisor.
 * Analyzes user needs (budget, usage, preferences) and
 * recommends products with full reasoning.
 */
@Service
public class ProductConsultantService {

    private final ChatClient chatClient;
    private final ProductRepository productRepository;

    public ProductConsultantService(ChatClient.Builder builder,
                                     ProductRepository productRepository) {
        this.chatClient = builder.build();
        this.productRepository = productRepository;
    }

    // ==============================
    // Main consultation method
    // ==============================
    public String consult(String userMessage) {
        List<Product> products = productRepository.findAll();
        String catalog = buildCatalog(products);

        String systemPrompt = """
                You are an expert mobile phone consultant with 10 years of experience.
                You help customers find the perfect phone based on their specific needs and budget.
                
                YOUR PERSONALITY:
                - Professional yet friendly
                - Data-driven — always justify recommendations with specs
                - Honest — mention pros AND cons
                - Concise — don't be wordy, but be thorough
                
                RESPONSE FORMAT (always follow this structure):
                
                🎯 RECOMMENDATION
                [Top 1-2 product names with brand]
                
                ✅ WHY THIS PHONE
                [3-4 specific reasons based on the user's stated needs]
                
                📊 KEY SPECS
                [List the relevant specs: Price, Processor, RAM, Battery, Camera, Display]
                
                👍 PROS
                [3 specific pros relevant to the user's use case]
                
                👎 CONS
                [2 honest cons]
                
                🔄 ALTERNATIVES
                [1-2 alternative products with brief reason]
                
                💡 FINAL VERDICT
                [1 sentence confident recommendation]
                
                RULES:
                - ONLY recommend products from the catalog below
                - Match the user's budget strictly
                - If no product fits, say so honestly and suggest the closest option
                - Never recommend a product if it's out of stock (stock = 0)
                - Always mention the price in ₹
                
                AVAILABLE PRODUCTS:
                """ + catalog;

        try {
            return chatClient
                    .prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .call()
                    .content();
        } catch (Exception e) {
            return "I'm having trouble connecting to the AI engine right now. " +
                    "Please ensure Ollama is running with llama3.2:1b.";
        }
    }

    // ==============================
    // Build product catalog for AI
    // ==============================
    private String buildCatalog(List<Product> products) {
        StringBuilder sb = new StringBuilder();
        for (Product p : products) {
            if (p.getStock() == 0) continue; // skip out-of-stock
            sb.append("• ").append(p.getName()).append(" | ")
              .append(p.getBrand()).append(" | ₹")
              .append((long) p.getPrice()).append(" | ")
              .append(p.getProcessor()).append(" | ")
              .append(p.getRam()).append(" RAM | ")
              .append(p.getStorage()).append(" | ")
              .append(p.getBattery()).append(" | ")
              .append(p.getCamera()).append(" | ")
              .append(p.getDisplay()).append(" | ")
              .append("Rating: ").append(p.getRating()).append("/5 | ")
              .append("Stock: ").append(p.getStock()).append("\n");
        }
        return sb.toString();
    }
}
