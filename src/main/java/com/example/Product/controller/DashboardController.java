package com.example.Product.controller;

import com.example.Product.dto.DashboardDTO;
import com.example.Product.dto.ProductAnalyticsDTO;
import com.example.Product.service.AnalyticsService;
import com.example.Product.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AnalyticsService analyticsService;

    public DashboardController(DashboardService dashboardService,
                                AnalyticsService analyticsService) {
        this.dashboardService = dashboardService;
        this.analyticsService = analyticsService;
    }

    // ==============================
    // GET Dashboard Summary
    // ==============================
    @GetMapping("/summary")
    public ResponseEntity<DashboardDTO> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }

    // ==============================
    // GET Full Analytics (Charts)
    // ==============================
    @GetMapping("/analytics")
    public ResponseEntity<ProductAnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }

    // ==============================
    // GET Brand-wise Count (Pie Chart)
    // ==============================
    @GetMapping("/charts/brand-count")
    public ResponseEntity<List<Map<String, Object>>> getBrandCount() {
        return ResponseEntity.ok(analyticsService.getBrandWiseCount());
    }

    // ==============================
    // GET Brand-wise Avg Price (Bar Chart)
    // ==============================
    @GetMapping("/charts/brand-avg-price")
    public ResponseEntity<List<Map<String, Object>>> getBrandAvgPrice() {
        return ResponseEntity.ok(analyticsService.getBrandAvgPrice());
    }

    // ==============================
    // GET Price Range Distribution (Pie Chart)
    // ==============================
    @GetMapping("/charts/price-range")
    public ResponseEntity<List<Map<String, Object>>> getPriceRange() {
        return ResponseEntity.ok(analyticsService.getPriceRangeDistribution());
    }

    // ==============================
    // GET Brand Avg Rating (Line Chart)
    // ==============================
    @GetMapping("/charts/brand-rating")
    public ResponseEntity<List<Map<String, Object>>> getBrandRating() {
        return ResponseEntity.ok(analyticsService.getBrandAvgRating());
    }
}
