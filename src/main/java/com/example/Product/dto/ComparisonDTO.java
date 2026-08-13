package com.example.Product.dto;

import java.util.List;

public class ComparisonDTO {

    private List<ComparisonItem> items;
    private String bestOverallName;

    public ComparisonDTO() {
    }

    public ComparisonDTO(List<ComparisonItem> items, String bestOverallName) {
        this.items = items;
        this.bestOverallName = bestOverallName;
    }

    public List<ComparisonItem> getItems() {
        return items;
    }

    public void setItems(List<ComparisonItem> items) {
        this.items = items;
    }

    public String getBestOverallName() {
        return bestOverallName;
    }

    public void setBestOverallName(String bestOverallName) {
        this.bestOverallName = bestOverallName;
    }
}