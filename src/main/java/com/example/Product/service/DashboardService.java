package com.example.Product.service;

import com.example.Product.dto.DashboardDTO;
import com.example.Product.dto.ProductDTO;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

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

        ProductDTO highestPrice = mapToDTO(firstOrNull(productRepository.findHighestPriceProducts(PageRequest.of(0, 1))));
        ProductDTO lowestPrice  = mapToDTO(firstOrNull(productRepository.findLowestPriceProducts(PageRequest.of(0, 1))));
        ProductDTO highestRated = mapToDTO(firstOrNull(productRepository.findHighestRatedProducts(PageRequest.of(0, 1))));

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
    // Helper: first element or null
    // ==============================
    private Product firstOrNull(List<Product> list) {
        return (list != null && !list.isEmpty()) ? list.get(0) : null;
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
