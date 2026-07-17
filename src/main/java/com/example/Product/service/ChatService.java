package com.example.Product.service;

import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * General-purpose chat service — used by the floating chatbot.
 * For advanced features, use NlQueryService, BusinessAnalystService,
 * ProductConsultantService.
 */
@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ProductRepository productRepository;

    public ChatService(ChatClient.Builder chatClientBuilder,
                       ProductRepository productRepository) {
        this.chatClient = chatClientBuilder.build();
        this.productRepository = productRepository;
    }

    public String chat(String userMessage) {
        List<Product> products = productRepository.findAll();
        String productContext = buildProductContext(products);

        String systemPrompt = """
                You are an AI Product Intelligence Assistant for a premium mobile phone platform.
                You have full knowledge of the product inventory listed below.
                
                CAPABILITIES:
                - Recommend phones based on budget, use case, or preferences
                - Compare products head-to-head
                - Answer inventory questions (stock, pricing, availability)
                - Explain specifications in simple terms
                - Provide business insights about the catalog
                
                RULES:
                - Answer ONLY based on the products listed below
                - Never mention products not in the list
                - Format responses clearly with product names, prices (₹), and key specs
                - If nothing matches, explain why and suggest alternatives
                - Sound professional and confident
                
                INVENTORY:
                """ + productContext;

        try {
            return chatClient.prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .call()
                    .content();
        } catch (Exception e) {
            return "AI service is temporarily unavailable. Please ensure Ollama is running with: ollama run llama3.2:1b";
        }
    }

    private String buildProductContext(List<Product> products) {
        StringBuilder sb = new StringBuilder();
        for (Product p : products) {
            sb.append("• ").append(p.getName())
              .append(" | ").append(p.getBrand())
              .append(" | ₹").append((long) p.getPrice())
              .append(" | ").append(p.getProcessor())
              .append(" | ").append(p.getRam()).append(" RAM")
              .append(" | ").append(p.getBattery())
              .append(" | ").append(p.getCamera())
              .append(" | Rating: ").append(p.getRating()).append("/5")
              .append(" | Stock: ").append(p.getStock()).append("\n");
        }
        return sb.toString();
    }
}
