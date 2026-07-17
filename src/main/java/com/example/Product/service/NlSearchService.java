package com.example.Product.service;

import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

/**
 * Feature 5 — Natural Language Search
 *
 * Parses plain-English queries into filter criteria and
 * returns matching products — no LLM needed, so it's
 * fast and always works.
 *
 * Supported intents:
 *   - budget / price under / below / above / between
 *   - brand name
 *   - display type (AMOLED, OLED, LCD)
 *   - RAM amount
 *   - processor keyword
 *   - battery capacity
 *   - camera megapixels
 *   - rating threshold
 *   - category: gaming / camera / budget / flagship / student
 */
@Service
public class NlSearchService {

    private final ProductRepository productRepository;

    public NlSearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ==============================
    // Result wrapper
    // ==============================
    public static class NlSearchResult {
        private List<Product> products;
        private String interpretation;
        private int count;

        public NlSearchResult(List<Product> products, String interpretation) {
            this.products = products;
            this.interpretation = interpretation;
            this.count = products.size();
        }

        public List<Product> getProducts() { return products; }
        public String getInterpretation() { return interpretation; }
        public int getCount() { return count; }
    }

    // ==============================
    // Main search entry
    // ==============================
    public NlSearchResult search(String query) {
        String q = query.toLowerCase().trim();
        List<Product> all = productRepository.findAll();
        List<Product> filtered = new ArrayList<>(all);
        List<String> appliedFilters = new ArrayList<>();

        // ── Price filters ──────────────────────────────────────
        // "under 40000" / "below ₹40k" / "less than 40000"
        Pattern underPattern = Pattern.compile("(?:under|below|less than|upto|up to)\\s*[₹]?\\s*(\\d+)k?");
        Matcher underMatcher = underPattern.matcher(q);
        if (underMatcher.find()) {
            double limit = parseAmount(underMatcher.group(1));
            filtered = filtered.stream().filter(p -> p.getPrice() <= limit).collect(Collectors.toList());
            appliedFilters.add("price ≤ ₹" + (long) limit);
        }

        // "above 50000" / "more than 50k"
        Pattern abovePattern = Pattern.compile("(?:above|over|more than|greater than)\\s*[₹]?\\s*(\\d+)k?");
        Matcher aboveMatcher = abovePattern.matcher(q);
        if (aboveMatcher.find()) {
            double limit = parseAmount(aboveMatcher.group(1));
            filtered = filtered.stream().filter(p -> p.getPrice() >= limit).collect(Collectors.toList());
            appliedFilters.add("price ≥ ₹" + (long) limit);
        }

        // "between 30000 and 60000"
        Pattern betweenPattern = Pattern.compile("between\\s*[₹]?\\s*(\\d+)k?\\s*(?:and|to|-|–)\\s*[₹]?\\s*(\\d+)k?");
        Matcher betweenMatcher = betweenPattern.matcher(q);
        if (betweenMatcher.find()) {
            double low  = parseAmount(betweenMatcher.group(1));
            double high = parseAmount(betweenMatcher.group(2));
            double finalLow = low;
            double finalHigh = high;
            filtered = filtered.stream()
                    .filter(p -> p.getPrice() >= finalLow && p.getPrice() <= finalHigh)
                    .collect(Collectors.toList());
            appliedFilters.add("price ₹" + (long) low + "–₹" + (long) high);
        }

        // ── Category shortcuts ─────────────────────────────────
        if (q.contains("gaming") || q.contains("game phone")) {
            filtered = filtered.stream().filter(p ->
                    containsAny(lower(p.getProcessor()),
                            "snapdragon 8 elite", "snapdragon 8 gen", "dimensity 9400",
                            "snapdragon 8s", "a18") ||
                    lower(p.getName()).contains("rog")
            ).collect(Collectors.toList());
            appliedFilters.add("gaming phones");
        }

        if (q.contains("flagship")) {
            filtered = filtered.stream().filter(p -> p.getPrice() > 75000).collect(Collectors.toList());
            appliedFilters.add("flagship (>₹75K)");
        }

        if (q.contains("budget") || q.contains("cheap") || q.contains("affordable")) {
            filtered = filtered.stream().filter(p -> p.getPrice() < 30000).collect(Collectors.toList());
            appliedFilters.add("budget (<₹30K)");
        }

        if (q.contains("student")) {
            filtered = filtered.stream().filter(p -> p.getPrice() < 35000).collect(Collectors.toList());
            appliedFilters.add("student-friendly (<₹35K)");
        }

        // ── Brand filter ───────────────────────────────────────
        String[] brands = {"apple", "samsung", "oneplus", "google", "xiaomi",
                "realme", "vivo", "oppo", "nothing", "motorola", "moto",
                "poco", "iqoo", "asus", "rog", "honor", "sony", "nokia",
                "lava", "redmi"};
        for (String brand : brands) {
            if (q.contains(brand)) {
                String matchBrand = brand.equals("moto") ? "motorola" :
                                    brand.equals("redmi") ? "xiaomi" : brand;
                filtered = filtered.stream()
                        .filter(p -> lower(p.getBrand()).contains(matchBrand) ||
                                     lower(p.getName()).contains(brand))
                        .collect(Collectors.toList());
                appliedFilters.add("brand: " + capitalize(brand));
                break;
            }
        }

        // ── Display type ───────────────────────────────────────
        if (q.contains("amoled")) {
            filtered = filtered.stream()
                    .filter(p -> lower(p.getDisplay()).contains("amoled"))
                    .collect(Collectors.toList());
            appliedFilters.add("AMOLED display");
        } else if (q.contains("oled")) {
            filtered = filtered.stream()
                    .filter(p -> lower(p.getDisplay()).contains("oled"))
                    .collect(Collectors.toList());
            appliedFilters.add("OLED display");
        }

        // ── RAM filter ─────────────────────────────────────────
        Pattern ramPattern = Pattern.compile("(\\d+)\\s*gb\\s*ram");
        Matcher ramMatcher = ramPattern.matcher(q);
        if (ramMatcher.find()) {
            String ramVal = ramMatcher.group(1) + "GB";
            filtered = filtered.stream()
                    .filter(p -> lower(p.getRam()).contains(ramVal.toLowerCase()))
                    .collect(Collectors.toList());
            appliedFilters.add("RAM: " + ramVal);
        }

        // ── Processor keyword ──────────────────────────────────
        if (q.contains("snapdragon")) {
            Pattern sdPattern = Pattern.compile("snapdragon\\s*([\\w\\s]+?)(?:\\s|$|,)");
            Matcher sdMatcher = sdPattern.matcher(q);
            String keyword = sdMatcher.find() ? "snapdragon " + sdMatcher.group(1).trim() : "snapdragon";
            filtered = filtered.stream()
                    .filter(p -> lower(p.getProcessor()).contains(keyword))
                    .collect(Collectors.toList());
            appliedFilters.add("processor: " + keyword);
        } else if (q.contains("dimensity")) {
            filtered = filtered.stream()
                    .filter(p -> lower(p.getProcessor()).contains("dimensity"))
                    .collect(Collectors.toList());
            appliedFilters.add("processor: Dimensity");
        } else if (q.contains("tensor")) {
            filtered = filtered.stream()
                    .filter(p -> lower(p.getProcessor()).contains("tensor"))
                    .collect(Collectors.toList());
            appliedFilters.add("processor: Tensor (Google)");
        } else if (q.contains("apple") && q.contains("chip") || q.contains("a18") || q.contains("bionic")) {
            filtered = filtered.stream()
                    .filter(p -> lower(p.getProcessor()).startsWith("apple"))
                    .collect(Collectors.toList());
            appliedFilters.add("processor: Apple Silicon");
        }

        // ── Battery size ───────────────────────────────────────
        Pattern batPattern = Pattern.compile("(\\d{4,5})\\s*mah");
        Matcher batMatcher = batPattern.matcher(q);
        if (batMatcher.find()) {
            int batCapacity = Integer.parseInt(batMatcher.group(1));
            filtered = filtered.stream()
                    .filter(p -> extractBatteryMah(p.getBattery()) >= batCapacity)
                    .collect(Collectors.toList());
            appliedFilters.add("battery ≥ " + batCapacity + "mAh");
        } else if (q.contains("big battery") || q.contains("long battery") || q.contains("battery life")) {
            filtered = filtered.stream()
                    .filter(p -> extractBatteryMah(p.getBattery()) >= 5000)
                    .collect(Collectors.toList());
            appliedFilters.add("battery ≥ 5000mAh");
        }

        // ── Rating threshold ───────────────────────────────────
        Pattern ratingPattern = Pattern.compile("(?:rating|rated)\\s*(?:above|over|>)?\\s*(\\d+\\.?\\d*)");
        Matcher ratingMatcher = ratingPattern.matcher(q);
        if (ratingMatcher.find()) {
            double minRating = Double.parseDouble(ratingMatcher.group(1));
            filtered = filtered.stream()
                    .filter(p -> p.getRating() >= minRating)
                    .collect(Collectors.toList());
            appliedFilters.add("rating ≥ " + minRating);
        }

        // ── Camera ─────────────────────────────────────────────
        if (q.contains("best camera") || q.contains("camera phone") || q.contains("photography")) {
            filtered = filtered.stream()
                    .sorted(Comparator.comparingInt(p -> -extractMaxMp(p.getCamera())))
                    .collect(Collectors.toList());
            appliedFilters.add("sorted by camera quality");
        }

        // ── Sort: highest rated ────────────────────────────────
        if (q.contains("highest rated") || q.contains("top rated") || q.contains("best rated")) {
            filtered = filtered.stream()
                    .sorted(Comparator.comparingDouble(Product::getRating).reversed())
                    .collect(Collectors.toList());
            appliedFilters.add("sorted by rating");
        }

        // ── Sort: cheapest ─────────────────────────────────────
        if (q.contains("cheapest") || q.contains("lowest price")) {
            filtered = filtered.stream()
                    .sorted(Comparator.comparingDouble(Product::getPrice))
                    .collect(Collectors.toList());
            appliedFilters.add("sorted by price (low to high)");
        }

        // ── Limit results ──────────────────────────────────────
        if (filtered.size() > 10) {
            filtered = filtered.subList(0, 10);
        }

        // Build interpretation
        String interpretation = appliedFilters.isEmpty()
                ? "Showing all products matching: \"" + query + "\""
                : "Applied filters: " + String.join(" · ", appliedFilters);

        return new NlSearchResult(filtered, interpretation);
    }

    // ─── Helpers ──────────────────────────────────────────

    private double parseAmount(String s) {
        double val = Double.parseDouble(s.replaceAll("[^\\d.]", ""));
        // If short number like "40" assume it means 40000 (k suffix handled)
        return val < 1000 ? val * 1000 : val;
    }

    private int extractBatteryMah(String battery) {
        if (battery == null) return 0;
        Matcher m = Pattern.compile("(\\d{4,5})").matcher(battery);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }

    private int extractMaxMp(String camera) {
        if (camera == null) return 0;
        Matcher m = Pattern.compile("(\\d+)\\s*mp").matcher(camera.toLowerCase());
        int max = 0;
        while (m.find()) {
            int val = Integer.parseInt(m.group(1));
            if (val > max) max = val;
        }
        return max;
    }

    private boolean containsAny(String text, String... terms) {
        for (String t : terms) if (text.contains(t)) return true;
        return false;
    }

    private String lower(String s) {
        return s == null ? "" : s.toLowerCase();
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
