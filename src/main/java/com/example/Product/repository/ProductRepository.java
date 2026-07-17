package com.example.Product.repository;

import com.example.Product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ==============================
    // Search: name, brand, processor, ram, storage, price
    // ==============================
    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.processor) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.ram) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.storage) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "CAST(p.price AS string) LIKE CONCAT('%', :keyword, '%')")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    // ==============================
    // Dashboard Queries
    // ==============================

    @Query("SELECT COUNT(p) FROM Product p")
    long countTotalProducts();

    @Query("SELECT SUM(p.stock) FROM Product p")
    Long totalInventoryCount();

    @Query("SELECT SUM(p.price * p.stock) FROM Product p")
    Double totalInventoryValue();

    @Query("SELECT AVG(p.price) FROM Product p")
    Double averagePrice();

    @Query("SELECT p FROM Product p WHERE p.price = (SELECT MAX(pp.price) FROM Product pp)")
    Product findHighestPriceProduct();

    @Query("SELECT p FROM Product p WHERE p.price = (SELECT MIN(pp.price) FROM Product pp)")
    Product findLowestPriceProduct();

    @Query("SELECT p FROM Product p WHERE p.rating = (SELECT MAX(pp.rating) FROM Product pp)")
    Product findHighestRatedProduct();

    // ==============================
    // Analytics Queries
    // ==============================

    @Query("SELECT p.brand AS brand, COUNT(p) AS count FROM Product p GROUP BY p.brand ORDER BY COUNT(p) DESC")
    List<Object[]> countByBrand();

    @Query("SELECT p.brand AS brand, AVG(p.price) AS avgPrice FROM Product p GROUP BY p.brand ORDER BY AVG(p.price) DESC")
    List<Object[]> avgPriceByBrand();

    @Query("SELECT " +
            "CASE " +
            "WHEN p.price < 25000 THEN 'Under 25K' " +
            "WHEN p.price < 50000 THEN '25K - 50K' " +
            "WHEN p.price < 75000 THEN '50K - 75K' " +
            "WHEN p.price < 100000 THEN '75K - 1L' " +
            "ELSE 'Above 1L' END AS range, COUNT(p) AS count " +
            "FROM Product p GROUP BY " +
            "CASE " +
            "WHEN p.price < 25000 THEN 'Under 25K' " +
            "WHEN p.price < 50000 THEN '25K - 50K' " +
            "WHEN p.price < 75000 THEN '50K - 75K' " +
            "WHEN p.price < 100000 THEN '75K - 1L' " +
            "ELSE 'Above 1L' END")
    List<Object[]> countByPriceRange();

    @Query("SELECT p.brand AS brand, AVG(p.rating) AS avgRating FROM Product p GROUP BY p.brand ORDER BY AVG(p.rating) DESC")
    List<Object[]> avgRatingByBrand();
}
