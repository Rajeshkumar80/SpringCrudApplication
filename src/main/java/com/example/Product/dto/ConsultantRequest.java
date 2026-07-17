package com.example.Product.dto;

import jakarta.validation.constraints.NotBlank;

public class ConsultantRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    public ConsultantRequest() {}

    public ConsultantRequest(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
