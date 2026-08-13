package com.example.Product.service;

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
class ProductConsultantServiceTest {

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

    private ProductConsultantService consultantService;

    private Product product(String name, double price, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setBrand("Samsung");
        p.setPrice(price);
        p.setProcessor("Snapdragon 8 Gen 3");
        p.setRam("12GB");
        p.setBattery("5000mAh");
        p.setCamera("50MP");
        p.setDisplay("AMOLED");
        p.setRating(4.5);
        p.setStock(stock);
        return p;
    }

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
        consultantService = new ProductConsultantService(chatClientBuilder, productRepository);
    }

    @Test
    void consult_returnsAiRecommendation() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponse);
        when(callResponse.content())
                .thenReturn("🎯 RECOMMENDATION\nGalaxy S26 Ultra for your budget.");
        when(productRepository.findAll())
                .thenReturn(List.of(product("Galaxy S26 Ultra", 139999, 7)));

        String reply = consultantService.consult("I need a flagship under 1.5 lakh");

        assertEquals("🎯 RECOMMENDATION\nGalaxy S26 Ultra for your budget.", reply);
    }

    @Test
    void consult_returnsFallbackMessageWhenAiFails() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("Ollama down"));
        when(productRepository.findAll()).thenReturn(List.of());

        String reply = consultantService.consult("Suggest a phone");

        assertTrue(reply.contains("trouble connecting to the AI engine"));
    }
}
