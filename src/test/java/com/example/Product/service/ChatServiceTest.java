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
class ChatServiceTest {

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

    private ChatService chatService;

    private Product product(String name, String brand, double price) {
        Product p = new Product();
        p.setName(name);
        p.setBrand(brand);
        p.setPrice(price);
        p.setProcessor("Snapdragon 8 Gen 3");
        p.setRam("12GB");
        p.setBattery("5000mAh");
        p.setCamera("50MP");
        p.setDisplay("AMOLED");
        p.setRating(4.5);
        p.setStock(10);
        return p;
    }

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
        chatService = new ChatService(chatClientBuilder, productRepository);
    }

    @Test
    void chat_returnsAiReply() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponse);
        when(callResponse.content()).thenReturn("I recommend the Galaxy S25 for gaming.");
        when(productRepository.findAll())
                .thenReturn(List.of(product("Galaxy S25", "Samsung", 65000)));

        String reply = chatService.chat("Best gaming phone?");

        assertEquals("I recommend the Galaxy S25 for gaming.", reply);
    }

    @Test
    void chat_returnsFallbackMessageWhenAiFails() {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenThrow(new RuntimeException("Ollama down"));
        when(productRepository.findAll()).thenReturn(List.of());

        String reply = chatService.chat("Hello");

        assertTrue(reply.contains("AI service is temporarily unavailable"));
    }
}
