package com.example.Product.service;

import com.example.Product.dto.ProductAnalyticsDTO;
import com.example.Product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    private final ProductRepository productRepository;

    public AnalyticsService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ==============================
    // Full Analytics Data
    // ==============================
    public ProductAnalyticsDTO getAnalytics() {
        return new ProductAnalyticsDTO(
                getBrandWiseCount(),
                getBrandAvgPrice(),
                getPriceRangeDistribution(),
                getBrandAvgRating()
        );
    }

    // ==============================
    // Brand-wise Product Count (Pie + Bar)
    // ==============================
    public List<Map<String, Object>> getBrandWiseCount() {
        List<Object[]> rows = productRepository.countByBrand();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("brand", row[0]);
            entry.put("count", row[1]);
            result.add(entry);
        }
        return result;
    }

    // ==============================
    // Brand-wise Average Price (Bar)
    // ==============================
    public List<Map<String, Object>> getBrandAvgPrice() {
        List<Object[]> rows = productRepository.avgPriceByBrand();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("brand", row[0]);
            double avgPrice = ((Number) row[1]).doubleValue();
            entry.put("avgPrice", Math.round(avgPrice * 100.0) / 100.0);
            result.add(entry);
        }
        return result;
    }

    // ==============================
    // Price Range Distribution (Pie)
    // ==============================
    public List<Map<String, Object>> getPriceRangeDistribution() {
        List<Object[]> rows = productRepository.countByPriceRange();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("range", row[0]);
            entry.put("count", row[1]);
            result.add(entry);
        }
        return result;
    }

    // ==============================
    // Brand-wise Average Rating (Line)
    // ==============================
    public List<Map<String, Object>> getBrandAvgRating() {
        List<Object[]> rows = productRepository.avgRatingByBrand();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("brand", row[0]);
            double avgRating = ((Number) row[1]).doubleValue();
            entry.put("avgRating", Math.round(avgRating * 100.0) / 100.0);
            result.add(entry);
        }
        return result;
    }
}
