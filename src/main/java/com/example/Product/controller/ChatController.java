package com.example.Product.controller;

import com.example.Product.dto.ChatRequest;
import com.example.Product.dto.ChatResponse;
import com.example.Product.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // ==============================
    // POST Chat with AI
    // ==============================
    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {
        try {
            String reply = chatService.chat(request.getMessage());
            return ResponseEntity.ok(ChatResponse.success(reply));
        } catch (Exception e) {
            return ResponseEntity.ok(
                    ChatResponse.error("AI service is currently unavailable. Please ensure Ollama is running."));
        }
    }
}
