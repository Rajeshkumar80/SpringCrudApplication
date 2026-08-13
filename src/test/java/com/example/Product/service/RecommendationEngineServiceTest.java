package com.example.Product.service;

import com.example.Product.dto.ProductScoreDTO;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationEngineServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private RecommendationEngineService engine;

    private Product phone(Long id, String name, String brand, double price,
                          String processor, String ram, String battery,
                          String camera, double rating) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setBrand(brand);
        p.setPrice(price);
        p.setProcessor(processor);
        p.setRam(ram);
        p.setStorage("256GB");
        p.setBattery(battery);
        p.setCamera(camera);
        p.setDisplay("6.7\" LTPO AMOLED 120Hz");
        p.setRating(rating);
        p.setStock(5);
        return p;
    }

    @Test
    void gamingScore_rewardsSnapdragon8EliteWithBigRam() {
        Product gaming = phone(1L, "ROG Phone", "ASUS", 70000,
                "Snapdragon 8 Elite", "16GB", "6000mAh", "50MP", 4.6);
        Product budget = phone(2L, "Budget Phone", "Xiaomi", 12000,
                "Snapdragon 4", "4GB", "5000mAh", "13MP", 4.0);

        ProductScoreDTO gamingDto = engine.score(gaming, 70000, 12000);
        ProductScoreDTO budgetDto = engine.score(budget, 70000, 12000);

        assertTrue(gamingDto.getGamingScore() > budgetDto.getGamingScore(),
                "Flagship gaming phone must outscore budget phone");
        assertTrue(gamingDto.getPrimaryTag().contains("Gaming")
                || gamingDto.getPrimaryTag().contains("Flagship"));
    }

    @Test
    void cameraScore_rewards200MpSensors() {
        Product pro = phone(1L, "Cam King", "Samsung", 60000,
                "Snapdragon 8 Gen 3", "12GB", "5000mAh",
                "200MP + 50MP + 12MP + 10MP", 4.7);
        Product basic = phone(2L, "Cam Basic", "Xiaomi", 15000,
                "Snapdragon 7", "8GB", "5000mAh", "13MP", 4.1);

        assertTrue(engine.score(pro, 60000, 15000).getCameraScore()
                        > engine.score(basic, 60000, 15000).getCameraScore(),
                "200MP multi-camera must outscore 13MP");
    }

    @Test
    void batteryScore_rewardsLargerMah() {
        Product big = phone(1L, "Battery King", "Motorola", 25000,
                "Snapdragon 7", "8GB", "6500mAh", "50MP", 4.5);
        Product small = phone(2L, "Battery Small", "Samsung", 55000,
                "Snapdragon 8 Gen 3", "12GB", "4383mAh", "50MP", 4.5);

        assertTrue(engine.score(big, 55000, 25000).getBatteryScore()
                        > engine.score(small, 55000, 25000).getBatteryScore(),
                "6500mAh must outscore 4383mAh");
    }

    @Test
    void overallScore_staysWithinZeroAndHundred() {
        when(productRepository.findAll()).thenReturn(List.of(
                phone(1L, "A", "Samsung", 30000, "Snapdragon 8 Gen 3", "12GB", "5500mAh", "108MP", 4.6),
                phone(2L, "B", "Apple", 90000, "A18 Pro", "12GB", "4685mAh", "48MP + 48MP", 4.9)));

        for (ProductScoreDTO dto : engine.scoreAll()) {
            assertTrue(dto.getOverallAiScore() >= 0 && dto.getOverallAiScore() <= 100,
                    "Overall score out of range: " + dto.getOverallAiScore());
            assertNotNull(dto.getPrimaryTag());
            assertNotNull(dto.getAiSummary());
        }
    }

    @Test
    void scoreAll_sortsByOverallDescending() {
        when(productRepository.findAll()).thenReturn(List.of(
                phone(1L, "Cheap", "Xiaomi", 12000, "Snapdragon 7", "8GB", "5000mAh", "50MP", 4.0),
                phone(2L, "Flagship", "Samsung", 140000, "Snapdragon 8 Elite", "16GB", "6000mAh", "200MP", 4.8)));

        List<ProductScoreDTO> sorted = engine.scoreAll();

        assertEquals(2, sorted.size());
        assertTrue(sorted.get(0).getOverallAiScore() >= sorted.get(1).getOverallAiScore(),
                "scoreAll must sort descending by overall");
    }

    @Test
    void valueScore_cheaperPhoneScoresHigher() {
        Product cheap = phone(1L, "Cheap", "Xiaomi", 12000, "Snapdragon 7", "8GB", "5000mAh", "50MP", 4.3);
        Product expensive = phone(2L, "Expensive", "Samsung", 120000, "Snapdragon 8 Gen 3", "12GB", "5000mAh", "108MP", 4.5);

        assertTrue(engine.score(cheap, 120000, 12000).getValueScore()
                        > engine.score(expensive, 120000, 12000).getValueScore(),
                "Cheaper phone must have higher value score");
    }
}
