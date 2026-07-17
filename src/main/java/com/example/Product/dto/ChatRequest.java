package com.example.Product.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    // ==============================
    // Constructors
    // ==============================

    public ChatRequest() {
    }

    public ChatRequest(String message) {
        this.message = message;
    }

    // ==============================
    // Getters and Setters
    // ==============================

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
