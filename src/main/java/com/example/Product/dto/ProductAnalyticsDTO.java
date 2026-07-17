package com.example.Product.dto;

import java.util.List;
import java.util.Map;

public class ProductAnalyticsDTO {

    // Brand-wise product count (for Pie + Bar chart)
    private List<Map<String, Object>> brandWiseCount;

    // Brand-wise average price (for Bar chart)
    private List<Map<String, Object>> brandAvgPrice;

    // Price range distribution (for Pie chart)
    private List<Map<String, Object>> priceRangeDistribution;

    // Brand-wise average rating (for Line chart)
    private List<Map<String, Object>> brandAvgRating;

    // ==============================
    // Constructors
    // ==============================

    public ProductAnalyticsDTO() {
    }

    public ProductAnalyticsDTO(List<Map<String, Object>> brandWiseCount,
                                List<Map<String, Object>> brandAvgPrice,
                                List<Map<String, Object>> priceRangeDistribution,
                                List<Map<String, Object>> brandAvgRating) {
        this.brandWiseCount = brandWiseCount;
        this.brandAvgPrice = brandAvgPrice;
        this.priceRangeDistribution = priceRangeDistribution;
        this.brandAvgRating = brandAvgRating;
    }

    // ==============================
    // Getters and Setters
    // ==============================

    public List<Map<String, Object>> getBrandWiseCount() {
        return brandWiseCount;
    }

    public void setBrandWiseCount(List<Map<String, Object>> brandWiseCount) {
        this.brandWiseCount = brandWiseCount;
    }

    public List<Map<String, Object>> getBrandAvgPrice() {
        return brandAvgPrice;
    }

    public void setBrandAvgPrice(List<Map<String, Object>> brandAvgPrice) {
        this.brandAvgPrice = brandAvgPrice;
    }

    public List<Map<String, Object>> getPriceRangeDistribution() {
        return priceRangeDistribution;
    }

    public void setPriceRangeDistribution(List<Map<String, Object>> priceRangeDistribution) {
        this.priceRangeDistribution = priceRangeDistribution;
    }

    public List<Map<String, Object>> getBrandAvgRating() {
        return brandAvgRating;
    }

    public void setBrandAvgRating(List<Map<String, Object>> brandAvgRating) {
        this.brandAvgRating = brandAvgRating;
    }
}
