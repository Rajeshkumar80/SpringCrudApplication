package com.example.Product.controller;

import com.example.Product.dto.ChatRequest;
import com.example.Product.dto.ChatResponse;
import com.example.Product.service.AiCacheService;
import com.example.Product.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;
    private final AiCacheService aiCacheService;

    public ChatController(ChatService chatService, AiCacheService aiCacheService) {
        this.chatService = chatService;
        this.aiCacheService = aiCacheService;
    }

    // ==============================
    // POST Chat with AI
    // ==============================
    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {
        String cacheKey = aiCacheService.key("chat", request.getMessage());
        Optional<Object> cached = aiCacheService.get(cacheKey);
        if (cached.isPresent()) {
            return ResponseEntity.ok()
                    .header("X-Cache", "HIT")
                    .body((ChatResponse) cached.get());
        }
        ChatResponse response;
        try {
            String reply = chatService.chat(request.getMessage());
            response = ChatResponse.success(reply);
        } catch (Exception e) {
            return ResponseEntity.ok(
                    ChatResponse.error("AI service is currently unavailable. Please ensure Ollama is running."));
        }
        aiCacheService.put(cacheKey, response);
        return ResponseEntity.ok()
                .header("X-Cache", "MISS")
                .body(response);
    }
}
