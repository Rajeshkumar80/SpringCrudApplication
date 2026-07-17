package com.example.Product.dto;

public class ChatResponse {

    private String reply;
    private boolean success;

    // ==============================
    // Constructors
    // ==============================

    public ChatResponse() {
    }

    public ChatResponse(String reply, boolean success) {
        this.reply = reply;
        this.success = success;
    }

    // ==============================
    // Static Factory Methods
    // ==============================

    public static ChatResponse success(String reply) {
        return new ChatResponse(reply, true);
    }

    public static ChatResponse error(String message) {
        return new ChatResponse(message, false);
    }

    // ==============================
    // Getters and Setters
    // ==============================

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
