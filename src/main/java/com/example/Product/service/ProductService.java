package com.example.Product.service;

import com.example.Product.dto.ProductDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    // CRUD
    List<ProductDTO> getAllProducts();

    ProductDTO getProductById(Long id);

    ProductDTO createProduct(ProductDTO productDTO);

    ProductDTO updateProduct(Long id, ProductDTO productDTO);

    void deleteProduct(Long id);

    // Pagination + Sorting
    Page<ProductDTO> getProductsPaged(int page, int size, String sortBy, String sortDir);

    // Search + Pagination
    Page<ProductDTO> searchProducts(String keyword, int page, int size, String sortBy, String sortDir);
}
