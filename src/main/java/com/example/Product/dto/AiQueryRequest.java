package com.example.Product.dto;

import jakarta.validation.constraints.NotBlank;

public class AiQueryRequest {

    @NotBlank(message = "Query cannot be empty")
    private String query;

    public AiQueryRequest() {}

    public AiQueryRequest(String query) {
        this.query = query;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
}
