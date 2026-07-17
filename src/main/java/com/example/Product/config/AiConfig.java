package com.example.Product.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    /**
     * Exposes a ChatClient.Builder bean so it can be injected
     * into ChatService. Spring AI auto-configures the underlying
     * Ollama ChatModel via application.properties.
     */
    @Bean
    public ChatClient.Builder chatClientBuilder(
            org.springframework.ai.chat.model.ChatModel chatModel) {
        return ChatClient.builder(chatModel);
    }
}
