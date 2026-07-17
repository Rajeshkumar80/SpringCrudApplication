package com.example.Product.dto;

import java.util.List;
import java.util.Map;

public class AiQueryResponse {

    private String question;
    private String aiExplanation;
    private List<Map<String, Object>> results;
    private int resultCount;
    private boolean success;
    private String errorMessage;

    public AiQueryResponse() {}

    // ── Getters & Setters ──────────────────────────────────

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAiExplanation() { return aiExplanation; }
    public void setAiExplanation(String aiExplanation) { this.aiExplanation = aiExplanation; }

    public List<Map<String, Object>> getResults() { return results; }
    public void setResults(List<Map<String, Object>> results) { this.results = results; }

    public int getResultCount() { return resultCount; }
    public void setResultCount(int resultCount) { this.resultCount = resultCount; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
