package com.example.Product.dto;

public class DashboardDTO {

    private long totalProducts;
    private long totalInventory;
    private double inventoryValue;
    private double averagePrice;
    private ProductDTO highestPriceProduct;
    private ProductDTO lowestPriceProduct;
    private ProductDTO highestRatedProduct;

    // ==============================
    // Constructors
    // ==============================

    public DashboardDTO() {
    }

    public DashboardDTO(long totalProducts, long totalInventory,
                        double inventoryValue, double averagePrice,
                        ProductDTO highestPriceProduct,
                        ProductDTO lowestPriceProduct,
                        ProductDTO highestRatedProduct) {
        this.totalProducts = totalProducts;
        this.totalInventory = totalInventory;
        this.inventoryValue = inventoryValue;
        this.averagePrice = averagePrice;
        this.highestPriceProduct = highestPriceProduct;
        this.lowestPriceProduct = lowestPriceProduct;
        this.highestRatedProduct = highestRatedProduct;
    }

    // ==============================
    // Getters and Setters
    // ==============================

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalInventory() {
        return totalInventory;
    }

    public void setTotalInventory(long totalInventory) {
        this.totalInventory = totalInventory;
    }

    public double getInventoryValue() {
        return inventoryValue;
    }

    public void setInventoryValue(double inventoryValue) {
        this.inventoryValue = inventoryValue;
    }

    public double getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(double averagePrice) {
        this.averagePrice = averagePrice;
    }

    public ProductDTO getHighestPriceProduct() {
        return highestPriceProduct;
    }

    public void setHighestPriceProduct(ProductDTO highestPriceProduct) {
        this.highestPriceProduct = highestPriceProduct;
    }

    public ProductDTO getLowestPriceProduct() {
        return lowestPriceProduct;
    }

    public void setLowestPriceProduct(ProductDTO lowestPriceProduct) {
        this.lowestPriceProduct = lowestPriceProduct;
    }

    public ProductDTO getHighestRatedProduct() {
        return highestRatedProduct;
    }

    public void setHighestRatedProduct(ProductDTO highestRatedProduct) {
        this.highestRatedProduct = highestRatedProduct;
    }
}
