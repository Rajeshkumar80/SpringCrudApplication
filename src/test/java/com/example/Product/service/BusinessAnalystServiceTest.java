package com.example.Product.service;

import com.example.Product.dto.BusinessInsightResponse;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusinessAnalystServiceTest {

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private ChatClient chatClient;

    @Mock
    private ChatClient.ChatClientRequestSpec requestSpec;

    @Mock
    private ChatClient.CallResponseSpec callResponse;

    @Mock
    private ProductRepository productRepository;

    private BusinessAnalystService analystService;

    private Product product(String name, String brand, double price, int stock, double rating) {
        Product p = new Product();
        p.setName(name);
        p.setBrand(brand);
        p.setPrice(price);
        p.setProcessor("Snapdragon 8 Gen 3");
        p.setRam("12GB");
        p.setStorage("256GB");
        p.setBattery("5000mAh");
        p.setCamera("50MP");
        p.setDisplay("AMOLED");
        p.setRating(rating);
        p.setStock(stock);
        return p;
    }

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
        analystService = new BusinessAnalystService(chatClientBuilder, productRepository);
    }

    private String aiOutput() {
        return "SUMMARY: Healthy inventory with strong premium mix.\n"
                + "INSIGHT: Samsung leads catalog.\n"
                + "INSIGHT: Stock is tight for flagships.\n"
                + "RECOMMENDATION: Restock Galaxy S26 Ultra.\n"
                + "RECOMMENDATION: Promote mid-range bundles.\n"
                + "RISK: Low stock on top sellers.\n"
                + "HEALTH: Good - steady sales and stable margins.\n";
    }

    @Test
    void analyze_parsesAiStructuredOutput() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponse);
        when(callResponse.content()).thenReturn(aiOutput());
        when(productRepository.findAll()).thenReturn(List.of(
                product("Galaxy S25", "Samsung", 65000, 20, 4.6),
                product("Galaxy A16", "Samsung", 15000, 3, 4.2),
                product("iPhone 17", "Apple", 90000, 1, 4.8)));

        BusinessInsightResponse response = analystService.analyze();

        assertTrue(response.isSuccess());
        assertEquals("Healthy inventory with strong premium mix.", response.getSummary());
        assertEquals(2, response.getInsights().size());
        assertEquals(2, response.getRecommendations().size());
        assertEquals(1, response.getRisks().size());
        assertEquals("Good - steady sales and stable margins.", response.getOverallHealth());
        assertEquals(0.87, response.getConfidenceScore());
    }

    @Test
    void analyze_fallsBackToRuleBasedInsightsWhenAiFails() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("Ollama down"));
        when(productRepository.findAll()).thenReturn(List.of(
                product("Galaxy S25", "Samsung", 65000, 20, 4.6),
                product("Galaxy A16", "Samsung", 15000, 3, 4.2),
                product("iPhone 17", "Apple", 90000, 1, 4.8)));

        BusinessInsightResponse response = analystService.analyze();

        assertTrue(response.isSuccess());
        assertFalse(response.getInsights().isEmpty());
        assertEquals(0.75, response.getConfidenceScore());
        assertTrue(response.getSummary().contains("3 products"));
        assertTrue(response.getInsights().stream()
                .anyMatch(i -> i.contains("Samsung leads")));
        assertTrue(response.getInsights().stream()
                .anyMatch(i -> i.contains("critically low in stock")));
        assertTrue(response.getRecommendations().stream()
                .anyMatch(r -> r.contains("Restock Galaxy A16")));
    }

    @Test
    void analyze_worksWithEmptyCatalog() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("Ollama down"));
        when(productRepository.findAll()).thenReturn(List.of());

        BusinessInsightResponse response = analystService.analyze();

        assertTrue(response.isSuccess());
        assertTrue(response.getInsights().size() >= 2);
        assertEquals(0.75, response.getConfidenceScore());
    }
}
