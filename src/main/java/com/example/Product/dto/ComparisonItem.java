package com.example.Product.dto;

public class ComparisonItem {

    private ProductDTO product;
    private boolean bestPrice;
    private boolean bestRating;
    private boolean bestBattery;
    private boolean bestOverall;

    public ComparisonItem() {
    }

    public ComparisonItem(ProductDTO product, boolean bestPrice, boolean bestRating,
                          boolean bestBattery, boolean bestOverall) {
        this.product = product;
        this.bestPrice = bestPrice;
        this.bestRating = bestRating;
        this.bestBattery = bestBattery;
        this.bestOverall = bestOverall;
    }

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    public boolean isBestPrice() {
        return bestPrice;
    }

    public void setBestPrice(boolean bestPrice) {
        this.bestPrice = bestPrice;
    }

    public boolean isBestRating() {
        return bestRating;
    }

    public void setBestRating(boolean bestRating) {
        this.bestRating = bestRating;
    }

    public boolean isBestBattery() {
        return bestBattery;
    }

    public void setBestBattery(boolean bestBattery) {
        this.bestBattery = bestBattery;
    }

    public boolean isBestOverall() {
        return bestOverall;
    }

    public void setBestOverall(boolean bestOverall) {
        this.bestOverall = bestOverall;
    }
}