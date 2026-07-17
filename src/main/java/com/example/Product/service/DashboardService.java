package com.example.Product.service;

import com.example.Product.dto.DashboardDTO;
import com.example.Product.dto.ProductDTO;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ProductRepository productRepository;

    public DashboardService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ==============================
    // Build Dashboard Summary
    // ==============================
    public DashboardDTO getDashboardData() {
        long totalProducts = productRepository.countTotalProducts();

        Long totalInventoryLong = productRepository.totalInventoryCount();
        long totalInventory = (totalInventoryLong != null) ? totalInventoryLong : 0L;

        Double inventoryValueDouble = productRepository.totalInventoryValue();
        double inventoryValue = (inventoryValueDouble != null) ? inventoryValueDouble : 0.0;

        Double averagePriceDouble = productRepository.averagePrice();
        double averagePrice = (averagePriceDouble != null) ? averagePriceDouble : 0.0;

        ProductDTO highestPrice = mapToDTO(productRepository.findHighestPriceProduct());
        ProductDTO lowestPrice = mapToDTO(productRepository.findLowestPriceProduct());
        ProductDTO highestRated = mapToDTO(productRepository.findHighestRatedProduct());

        return new DashboardDTO(
                totalProducts,
                totalInventory,
                Math.round(inventoryValue * 100.0) / 100.0,
                Math.round(averagePrice * 100.0) / 100.0,
                highestPrice,
                lowestPrice,
                highestRated
        );
    }

    // ==============================
    // Mapper Helper
    // ==============================
    private ProductDTO mapToDTO(Product product) {
        if (product == null) return null;
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setPrice(product.getPrice());
        dto.setProcessor(product.getProcessor());
        dto.setRam(product.getRam());
        dto.setStorage(product.getStorage());
        dto.setBattery(product.getBattery());
        dto.setCamera(product.getCamera());
        dto.setDisplay(product.getDisplay());
        dto.setRating(product.getRating());
        dto.setStock(product.getStock());
        dto.setImageUrl(product.getImageUrl());
        return dto;
    }
}
