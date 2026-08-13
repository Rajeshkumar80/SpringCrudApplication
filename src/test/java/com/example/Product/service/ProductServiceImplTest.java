package com.example.Product.service;

import com.example.Product.dto.ComparisonDTO;
import com.example.Product.dto.ComparisonItem;
import com.example.Product.dto.ProductDTO;
import com.example.Product.dto.ProductScoreDTO;
import com.example.Product.exception.ResourceNotFoundException;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RecommendationEngineService recommendationEngineService;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product sampleProduct(Long id, String name, double price) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setBrand("Samsung");
        p.setPrice(price);
        p.setProcessor("Snapdragon 8 Elite");
        p.setRam("12GB");
        p.setStorage("256GB");
        p.setBattery("5000mAh");
        p.setCamera("50MP");
        p.setDisplay("6.7\" AMOLED 120Hz");
        p.setRating(4.5);
        p.setStock(10);
        return p;
    }

    @Test
    void getAllProducts_mapsAllEntitiesToDtos() {
        when(productRepository.findAll())
                .thenReturn(List.of(sampleProduct(1L, "Galaxy S25", 65000)));

        List<ProductDTO> result = productService.getAllProducts();

        assertEquals(1, result.size());
        assertEquals("Galaxy S25", result.get(0).getName());
        assertEquals(65000, result.get(0).getPrice());
        assertEquals("5000mAh", result.get(0).getBattery());
    }

    @Test
    void getProductById_returnsDtoWhenFound() {
        when(productRepository.findById(5L))
                .thenReturn(Optional.of(sampleProduct(5L, "Galaxy Z Flip", 90000)));

        ProductDTO result = productService.getProductById(5L);

        assertEquals(5L, result.getId());
        assertEquals("Galaxy Z Flip", result.getName());
    }

    @Test
    void getProductById_throwsWhenNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.getProductById(99L));
    }

    @Test
    void createProduct_savesAndReturnsDto() {
        when(productRepository.save(any(Product.class)))
                .thenAnswer(inv -> {
                    Product p = inv.getArgument(0);
                    p.setId(10L);
                    return p;
                });

        ProductDTO dto = new ProductDTO();
        dto.setName("New Phone");
        dto.setBrand("Xiaomi");
        dto.setPrice(30000);
        dto.setRating(4.2);
        dto.setStock(5);

        ProductDTO result = productService.createProduct(dto);

        assertEquals(10L, result.getId());
        assertEquals("New Phone", result.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_updatesExistingFields() {
        when(productRepository.findById(3L))
                .thenReturn(Optional.of(sampleProduct(3L, "Old Name", 100)));
        when(productRepository.save(any(Product.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ProductDTO dto = new ProductDTO();
        dto.setName("Updated Name");
        dto.setBrand("Samsung");
        dto.setPrice(50000);
        dto.setRating(4.8);
        dto.setStock(20);

        ProductDTO result = productService.updateProduct(3L, dto);

        assertEquals("Updated Name", result.getName());
        assertEquals(50000, result.getPrice());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_throwsWhenNotFound() {
        when(productRepository.findById(3L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.updateProduct(3L, new ProductDTO()));
    }

    @Test
    void deleteProduct_deletesWhenFound() {
        when(productRepository.findById(7L))
                .thenReturn(Optional.of(sampleProduct(7L, "To Delete", 100)));

        productService.deleteProduct(7L);

        verify(productRepository).delete(any(Product.class));
    }

    @Test
    void deleteProduct_throwsWhenNotFound() {
        when(productRepository.findById(7L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.deleteProduct(7L));
    }

    @Test
    void updateImageUrl_setsUrlAndSaves() {
        when(productRepository.findById(2L))
                .thenReturn(Optional.of(sampleProduct(2L, "With Image", 100)));
        when(productRepository.save(any(Product.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ProductDTO result = productService.updateImageUrl(2L, "/uploads/products/x.jpg");

        assertEquals("/uploads/products/x.jpg", result.getImageUrl());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void compareProducts_marksBestFlagsAndBestOverall() {
        Product cheap = sampleProduct(1L, "Budget Phone", 20000);
        cheap.setBattery("5000mAh");
        cheap.setRating(4.2);

        Product premium = sampleProduct(2L, "Premium Phone", 90000);
        premium.setBattery("6500mAh");
        premium.setRating(4.9);

        when(productRepository.findById(1L)).thenReturn(Optional.of(cheap));
        when(productRepository.findById(2L)).thenReturn(Optional.of(premium));

        when(recommendationEngineService.score(any(Product.class), anyDouble(), anyDouble()))
                .thenAnswer(inv -> {
                    Product p = inv.getArgument(0);
                    ProductScoreDTO dto = new ProductScoreDTO();
                    dto.setOverallAiScore(p.getId() == 2L ? 92 : 60);
                    return dto;
                });

        ComparisonDTO result = productService.compareProducts(List.of(1L, 2L));

        assertEquals(2, result.getItems().size());
        assertEquals("Premium Phone", result.getBestOverallName());

        ComparisonItem cheapItem = result.getItems().get(0);
        assertTrue(cheapItem.isBestPrice(), "Cheapest product must be flagged best price");
        assertFalse(cheapItem.isBestOverall());

        ComparisonItem premiumItem = result.getItems().get(1);
        assertTrue(premiumItem.isBestRating());
        assertTrue(premiumItem.isBestBattery());
        assertTrue(premiumItem.isBestOverall());
    }

    @Test
    void compareProducts_rejectsWrongIdCount() {
        assertThrows(IllegalArgumentException.class,
                () -> productService.compareProducts(List.of(1L)));
        assertThrows(IllegalArgumentException.class,
                () -> productService.compareProducts(List.of(1L, 2L, 3L, 4L)));
        assertThrows(IllegalArgumentException.class,
                () -> productService.compareProducts(List.of()));
    }

    @Test
    void compareProducts_throwsWhenIdMissing() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.compareProducts(List.of(1L, 2L)));
    }
}
