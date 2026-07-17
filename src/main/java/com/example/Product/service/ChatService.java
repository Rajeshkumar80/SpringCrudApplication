package com.example.Product.service;

import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ProductRepository productRepository;

    public ChatService(ChatClient.Builder chatClientBuilder,
                       ProductRepository productRepository) {
        this.chatClient = chatClientBuilder.build();
        this.productRepository = productRepository;
    }

    // ==============================
    // Chat with AI using DB context
    // ==============================
    public String chat(String userMessage) {
        List<Product> products = productRepository.findAll();
        String productContext = buildProductContext(products);

        String systemPrompt = """
                You are an AI Product Assistant for a mobile phone store.
                Your job is to help users find the best products from our inventory.
                
                IMPORTANT RULES:
                - Answer ONLY based on the products listed below.
                - Do NOT mention products that are not in the list.
                - If no product matches the query, say "No matching product found in our inventory."
                - Be concise, helpful, and professional.
                - When listing products, always show: Name, Brand, Price (₹), Processor, RAM, Camera, Battery, Rating.
                - Format prices in Indian Rupees (₹).
                
                AVAILABLE PRODUCTS IN INVENTORY:
                """ + productContext;

        try {
            return chatClient
                    .prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .call()
                    .content();
        } catch (Exception e) {
            return "Sorry, I am unable to process your request right now. Please try again later.";
        }
    }

    // ==============================
    // Build product list for prompt
    // ==============================
    private String buildProductContext(List<Product> products) {
        StringBuilder sb = new StringBuilder();
        for (Product p : products) {
            sb.append("---\n");
            sb.append("Name: ").append(p.getName()).append("\n");
            sb.append("Brand: ").append(p.getBrand()).append("\n");
            sb.append("Price: ₹").append((long) p.getPrice()).append("\n");
            sb.append("Processor: ").append(p.getProcessor()).append("\n");
            sb.append("RAM: ").append(p.getRam()).append("\n");
            sb.append("Storage: ").append(p.getStorage()).append("\n");
            sb.append("Battery: ").append(p.getBattery()).append("\n");
            sb.append("Camera: ").append(p.getCamera()).append("\n");
            sb.append("Display: ").append(p.getDisplay()).append("\n");
            sb.append("Rating: ").append(p.getRating()).append("/5\n");
            sb.append("Stock: ").append(p.getStock()).append(" units\n");
        }
        return sb.toString();
    }
}
