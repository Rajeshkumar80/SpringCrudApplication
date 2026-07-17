package com.example.Product.dto;

public class ProductScoreDTO {

    private Long id;
    private String name;
    private String brand;
    private double price;
    private double rating;
    private int stock;
    private String processor;
    private String ram;
    private String battery;
    private String camera;
    private String display;
    private String storage;

    // AI Scores (0-100)
    private int gamingScore;
    private int cameraScore;
    private int batteryScore;
    private int displayScore;
    private int performanceScore;
    private int valueScore;
    private int overallAiScore;

    // Labels
    private String primaryTag;       // "Best Gaming", "Best Camera", etc.
    private String aiSummary;        // One-line AI explanation

    public ProductScoreDTO() {}

    // ── Getters & Setters ──────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getProcessor() { return processor; }
    public void setProcessor(String processor) { this.processor = processor; }

    public String getRam() { return ram; }
    public void setRam(String ram) { this.ram = ram; }

    public String getBattery() { return battery; }
    public void setBattery(String battery) { this.battery = battery; }

    public String getCamera() { return camera; }
    public void setCamera(String camera) { this.camera = camera; }

    public String getDisplay() { return display; }
    public void setDisplay(String display) { this.display = display; }

    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }

    public int getGamingScore() { return gamingScore; }
    public void setGamingScore(int gamingScore) { this.gamingScore = gamingScore; }

    public int getCameraScore() { return cameraScore; }
    public void setCameraScore(int cameraScore) { this.cameraScore = cameraScore; }

    public int getBatteryScore() { return batteryScore; }
    public void setBatteryScore(int batteryScore) { this.batteryScore = batteryScore; }

    public int getDisplayScore() { return displayScore; }
    public void setDisplayScore(int displayScore) { this.displayScore = displayScore; }

    public int getPerformanceScore() { return performanceScore; }
    public void setPerformanceScore(int performanceScore) { this.performanceScore = performanceScore; }

    public int getValueScore() { return valueScore; }
    public void setValueScore(int valueScore) { this.valueScore = valueScore; }

    public int getOverallAiScore() { return overallAiScore; }
    public void setOverallAiScore(int overallAiScore) { this.overallAiScore = overallAiScore; }

    public String getPrimaryTag() { return primaryTag; }
    public void setPrimaryTag(String primaryTag) { this.primaryTag = primaryTag; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
}
