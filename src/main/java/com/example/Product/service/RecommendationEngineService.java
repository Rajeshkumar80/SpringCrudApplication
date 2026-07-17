package com.example.Product.service;

import com.example.Product.dto.ProductScoreDTO;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Feature 4 — AI Recommendation Engine
 *
 * Scores every product across multiple dimensions:
 *   Gaming, Camera, Battery, Display, Performance, Value, Overall
 *
 * Scoring is rule-based (fast, deterministic) so it works
 * regardless of whether Ollama is running. The scores are
 * computed from the actual spec strings in the database.
 */
@Service
public class RecommendationEngineService {

    private final ProductRepository productRepository;

    public RecommendationEngineService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ==============================
    // Score all products
    // ==============================
    public List<ProductScoreDTO> scoreAll() {
        List<Product> products = productRepository.findAll();

        // Compute price stats for value score normalization
        double maxPrice = products.stream().mapToDouble(Product::getPrice).max().orElse(1);
        double minPrice = products.stream().mapToDouble(Product::getPrice).min().orElse(0);

        return products.stream()
                .map(p -> score(p, maxPrice, minPrice))
                .sorted(Comparator.comparingInt(ProductScoreDTO::getOverallAiScore).reversed())
                .collect(Collectors.toList());
    }

    // ==============================
    // Score by category
    // ==============================
    public Map<String, List<ProductScoreDTO>> getTopByCategory() {
        List<ProductScoreDTO> all = scoreAll();
        Map<String, List<ProductScoreDTO>> result = new LinkedHashMap<>();

        result.put("topGaming",      top(all, Comparator.comparingInt(ProductScoreDTO::getGamingScore).reversed(), 3));
        result.put("topCamera",      top(all, Comparator.comparingInt(ProductScoreDTO::getCameraScore).reversed(), 3));
        result.put("topBattery",     top(all, Comparator.comparingInt(ProductScoreDTO::getBatteryScore).reversed(), 3));
        result.put("topPerformance", top(all, Comparator.comparingInt(ProductScoreDTO::getPerformanceScore).reversed(), 3));
        result.put("topValue",       top(all, Comparator.comparingInt(ProductScoreDTO::getValueScore).reversed(), 3));
        result.put("topOverall",     top(all, Comparator.comparingInt(ProductScoreDTO::getOverallAiScore).reversed(), 5));

        return result;
    }

    // ==============================
    // Score a single product
    // ==============================
    public ProductScoreDTO score(Product p, double maxPrice, double minPrice) {
        ProductScoreDTO dto = new ProductScoreDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setBrand(p.getBrand());
        dto.setPrice(p.getPrice());
        dto.setRating(p.getRating());
        dto.setStock(p.getStock());
        dto.setProcessor(p.getProcessor());
        dto.setRam(p.getRam());
        dto.setBattery(p.getBattery());
        dto.setCamera(p.getCamera());
        dto.setDisplay(p.getDisplay());
        dto.setStorage(p.getStorage());

        int gaming      = computeGamingScore(p);
        int camera      = computeCameraScore(p);
        int battery     = computeBatteryScore(p);
        int display     = computeDisplayScore(p);
        int performance = computePerformanceScore(p);
        int value       = computeValueScore(p, maxPrice, minPrice);

        dto.setGamingScore(gaming);
        dto.setCameraScore(camera);
        dto.setBatteryScore(battery);
        dto.setDisplayScore(display);
        dto.setPerformanceScore(performance);
        dto.setValueScore(value);

        // Overall = weighted average
        int overall = (int) Math.round(
            gaming * 0.20 + camera * 0.20 + battery * 0.15 +
            display * 0.15 + performance * 0.20 + value * 0.10
        );
        // Boost slightly based on rating
        overall = Math.min(100, (int)(overall + (p.getRating() - 3.0) * 4));
        dto.setOverallAiScore(Math.max(0, overall));

        // Assign primary tag
        dto.setPrimaryTag(determinePrimaryTag(gaming, camera, battery, display, performance, value, p.getPrice()));

        // AI summary line
        dto.setAiSummary(buildSummary(dto));

        return dto;
    }

    // ─── Scoring algorithms ───────────────────────────────

    private int computeGamingScore(Product p) {
        int score = 50;
        String proc = lower(p.getProcessor());
        String ram  = lower(p.getRam());

        // Processor tier
        if (proc.contains("snapdragon 8 elite") || proc.contains("dimensity 9400")) score += 40;
        else if (proc.contains("snapdragon 8 gen") || proc.contains("dimensity 9300")) score += 35;
        else if (proc.contains("snapdragon 8s") || proc.contains("dimensity 8")) score += 25;
        else if (proc.contains("snapdragon 7") || proc.contains("dimensity 7")) score += 15;
        else if (proc.contains("a18 pro") || proc.contains("a18")) score += 38;
        else if (proc.contains("a17") || proc.contains("a16")) score += 30;

        // RAM
        if (ram.contains("24gb") || ram.contains("16gb")) score += 10;
        else if (ram.contains("12gb")) score += 6;
        else if (ram.contains("8gb")) score += 2;

        // ROG / gaming brand
        String name = lower(p.getName()) + lower(p.getBrand());
        if (name.contains("rog") || name.contains("gaming")) score += 5;

        return Math.min(100, score);
    }

    private int computeCameraScore(Product p) {
        int score = 40;
        String cam = lower(p.getCamera());

        if (cam.contains("200mp")) score += 40;
        else if (cam.contains("108mp")) score += 30;
        else if (cam.contains("64mp")) score += 20;
        else if (cam.contains("50mp")) score += 15;
        else if (cam.contains("48mp")) score += 12;

        // Multi-camera bonus
        long mpCount = Arrays.stream(cam.split("\\+")).count();
        if (mpCount >= 4) score += 10;
        else if (mpCount >= 3) score += 6;
        else if (mpCount >= 2) score += 3;

        // Brand partnerships
        if (cam.contains("zeiss") || cam.contains("hasselblad") || cam.contains("leica")) score += 8;

        // Pixel / iPhone camera reputation
        String name = lower(p.getName()) + lower(p.getBrand());
        if (name.contains("pixel") || name.contains("iphone")) score += 5;

        return Math.min(100, score);
    }

    private int computeBatteryScore(Product p) {
        int score = 30;
        String bat = lower(p.getBattery());

        if (bat.contains("7000") || bat.contains("6500")) score += 60;
        else if (bat.contains("6000") || bat.contains("6100") || bat.contains("6150")) score += 50;
        else if (bat.contains("5500") || bat.contains("5800") || bat.contains("5910")) score += 40;
        else if (bat.contains("5000") || bat.contains("5100") || bat.contains("5060")) score += 30;
        else if (bat.contains("4900") || bat.contains("4685")) score += 20;
        else if (bat.contains("4400") || bat.contains("4383")) score += 10;

        return Math.min(100, score);
    }

    private int computeDisplayScore(Product p) {
        int score = 40;
        String disp = lower(p.getDisplay());

        // Panel type
        if (disp.contains("ltpo")) score += 20;
        else if (disp.contains("amoled")) score += 15;
        else if (disp.contains("oled")) score += 12;
        else if (disp.contains("poled")) score += 12;
        else if (disp.contains("ips")) score += 5;

        // Refresh rate
        if (disp.contains("185hz") || disp.contains("144hz")) score += 15;
        else if (disp.contains("120hz")) score += 10;
        else if (disp.contains("90hz")) score += 5;

        // Size
        if (disp.contains("6.9") || disp.contains("6.8") || disp.contains("7.6")) score += 8;
        else if (disp.contains("6.7") || disp.contains("6.78")) score += 5;

        // 4K
        if (disp.contains("4k")) score += 10;

        return Math.min(100, score);
    }

    private int computePerformanceScore(Product p) {
        int score = 40;
        String proc = lower(p.getProcessor());
        String ram  = lower(p.getRam());

        if (proc.contains("snapdragon 8 elite") || proc.contains("dimensity 9400")) score += 45;
        else if (proc.contains("snapdragon 8 gen 3") || proc.contains("a18 pro")) score += 40;
        else if (proc.contains("snapdragon 8 gen") || proc.contains("a18")) score += 35;
        else if (proc.contains("snapdragon 8s") || proc.contains("tensor g4")) score += 28;
        else if (proc.contains("dimensity 8") || proc.contains("snapdragon 7")) score += 18;
        else if (proc.contains("a17") || proc.contains("a16")) score += 32;

        if (ram.contains("24gb")) score += 8;
        else if (ram.contains("16gb")) score += 6;
        else if (ram.contains("12gb")) score += 3;

        return Math.min(100, score);
    }

    private int computeValueScore(Product p, double maxPrice, double minPrice) {
        // Value = high rating + low price relative to segment
        double normalizedPrice = (maxPrice - minPrice) > 0
                ? (p.getPrice() - minPrice) / (maxPrice - minPrice)
                : 0.5;

        // Invert price contribution — cheaper = better value
        double priceScore = (1 - normalizedPrice) * 60;
        double ratingScore = ((p.getRating() - 1.0) / 4.0) * 40;

        return Math.min(100, (int)(priceScore + ratingScore));
    }

    private String determinePrimaryTag(int gaming, int camera, int battery,
                                        int display, int performance, int value, double price) {
        int max = Math.max(gaming, Math.max(camera, Math.max(battery,
                Math.max(display, Math.max(performance, value)))));

        if (price < 25000) return "💰 Budget Pick";
        if (price > 100000) return "👑 Flagship";
        if (gaming == max) return "🎮 Gaming Beast";
        if (camera == max) return "📷 Camera Champion";
        if (battery == max) return "🔋 Battery King";
        if (performance == max) return "⚡ Performance Leader";
        if (value == max) return "🏆 Best Value";
        return "⭐ Top Rated";
    }

    private String buildSummary(ProductScoreDTO dto) {
        String tag = dto.getPrimaryTag();
        if (tag.contains("Gaming")) {
            return "Powered by " + dto.getProcessor() + " — dominates gaming performance.";
        } else if (tag.contains("Camera")) {
            return "Exceptional " + dto.getCamera() + " system for photography enthusiasts.";
        } else if (tag.contains("Battery")) {
            return dto.getBattery() + " battery ensures all-day and overnight use.";
        } else if (tag.contains("Flagship")) {
            return "Top-tier flagship with premium specs across every category.";
        } else if (tag.contains("Budget")) {
            return "Best-in-class value at ₹" + (long) dto.getPrice() + " — ideal for budget buyers.";
        } else {
            return "Rated " + dto.getRating() + "/5 — a well-rounded performer at ₹" + (long) dto.getPrice() + ".";
        }
    }

    private String lower(String s) {
        return s == null ? "" : s.toLowerCase();
    }

    private <T> List<T> top(List<T> list, Comparator<T> comp, int n) {
        return list.stream().sorted(comp).limit(n).collect(Collectors.toList());
    }
}
