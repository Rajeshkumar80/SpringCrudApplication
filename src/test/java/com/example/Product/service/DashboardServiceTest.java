package com.example.Product.service;

import com.example.Product.dto.DashboardDTO;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private Product product(Long id, String name, double price, double rating, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setBrand("Samsung");
        p.setPrice(price);
        p.setRating(rating);
        p.setStock(stock);
        return p;
    }

    @Test
    void getDashboardData_aggregatesAllStats() {
        when(productRepository.countTotalProducts()).thenReturn(42L);
        when(productRepository.totalInventoryCount()).thenReturn(120L);
        when(productRepository.totalInventoryValue()).thenReturn(5_000_000.0);
        when(productRepository.averagePrice()).thenReturn(119_047.62);
        when(productRepository.findHighestPriceProducts(anyPageable()))
                .thenReturn(List.of(product(1L, "Most Expensive", 200000, 4.5, 1)));
        when(productRepository.findLowestPriceProducts(anyPageable()))
                .thenReturn(List.of(product(2L, "Cheapest", 10000, 4.0, 30)));
        when(productRepository.findHighestRatedProducts(anyPageable()))
                .thenReturn(List.of(product(3L, "Top Rated", 50000, 4.9, 10)));

        DashboardDTO dto = dashboardService.getDashboardData();

        assertEquals(42, dto.getTotalProducts());
        assertEquals(120, dto.getTotalInventory());
        assertEquals(5_000_000.0, dto.getInventoryValue());
        assertEquals(119_047.62, dto.getAveragePrice());
        assertEquals("Most Expensive", dto.getHighestPriceProduct().getName());
        assertEquals("Cheapest", dto.getLowestPriceProduct().getName());
        assertEquals("Top Rated", dto.getHighestRatedProduct().getName());
    }

    @Test
    void getDashboardData_handlesNullAggregates() {
        when(productRepository.countTotalProducts()).thenReturn(0L);
        when(productRepository.totalInventoryCount()).thenReturn(null);
        when(productRepository.totalInventoryValue()).thenReturn(null);
        when(productRepository.averagePrice()).thenReturn(null);
        when(productRepository.findHighestPriceProducts(anyPageable())).thenReturn(List.of());
        when(productRepository.findLowestPriceProducts(anyPageable())).thenReturn(List.of());
        when(productRepository.findHighestRatedProducts(anyPageable())).thenReturn(List.of());

        DashboardDTO dto = dashboardService.getDashboardData();

        assertEquals(0L, dto.getTotalInventory());
        assertEquals(0.0, dto.getInventoryValue());
        assertEquals(0.0, dto.getAveragePrice());
        assertNull(dto.getHighestPriceProduct());
        assertNull(dto.getLowestPriceProduct());
        assertNull(dto.getHighestRatedProduct());
    }

    private static org.springframework.data.domain.Pageable anyPageable() {
        return org.mockito.ArgumentMatchers.any(Pageable.class);
    }
}
