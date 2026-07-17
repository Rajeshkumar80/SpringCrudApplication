package com.example.Product.service;

import com.example.Product.dto.ProductDTO;
import com.example.Product.exception.ResourceNotFoundException;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ==============================
    // Mapper: Entity → DTO
    // ==============================
    private ProductDTO mapToDTO(Product product) {
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

    // ==============================
    // Mapper: DTO → Entity
    // ==============================
    private Product mapToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setPrice(dto.getPrice());
        product.setProcessor(dto.getProcessor());
        product.setRam(dto.getRam());
        product.setStorage(dto.getStorage());
        product.setBattery(dto.getBattery());
        product.setCamera(dto.getCamera());
        product.setDisplay(dto.getDisplay());
        product.setRating(dto.getRating());
        product.setStock(dto.getStock());
        product.setImageUrl(dto.getImageUrl());
        return product;
    }

    // ==============================
    // Get All Products
    // ==============================
    @Override
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ==============================
    // Get Product By ID
    // ==============================
    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }

    // ==============================
    // Create Product
    // ==============================
    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = mapToEntity(productDTO);
        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    // ==============================
    // Update Product
    // ==============================
    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        existing.setName(productDTO.getName());
        existing.setBrand(productDTO.getBrand());
        existing.setPrice(productDTO.getPrice());
        existing.setProcessor(productDTO.getProcessor());
        existing.setRam(productDTO.getRam());
        existing.setStorage(productDTO.getStorage());
        existing.setBattery(productDTO.getBattery());
        existing.setCamera(productDTO.getCamera());
        existing.setDisplay(productDTO.getDisplay());
        existing.setRating(productDTO.getRating());
        existing.setStock(productDTO.getStock());
        existing.setImageUrl(productDTO.getImageUrl());

        Product updated = productRepository.save(existing);
        return mapToDTO(updated);
    }

    // ==============================
    // Delete Product
    // ==============================
    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }

    // ==============================
    // Paginated + Sorted Products
    // ==============================
    @Override
    public Page<ProductDTO> getProductsPaged(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findAll(pageable).map(this::mapToDTO);
    }

    // ==============================
    // Search + Pagination + Sorting
    // ==============================
    @Override
    public Page<ProductDTO> searchProducts(String keyword, int page, int size,
                                           String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.searchProducts(keyword, pageable).map(this::mapToDTO);
    }
}
