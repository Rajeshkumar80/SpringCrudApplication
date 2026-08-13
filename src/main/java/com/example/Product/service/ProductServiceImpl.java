package com.example.Product.service;

import com.example.Product.dto.ComparisonDTO;
import com.example.Product.dto.ComparisonItem;
import com.example.Product.dto.ProductDTO;
import com.example.Product.exception.ResourceNotFoundException;
import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final RecommendationEngineService recommendationEngineService;

    private static final Pattern MAH_PATTERN = Pattern.compile("\\d+");

    public ProductServiceImpl(ProductRepository productRepository,
                              RecommendationEngineService recommendationEngineService) {
        this.productRepository = productRepository;
        this.recommendationEngineService = recommendationEngineService;
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
    // Update Product Image URL
    // ==============================
    @Override
    public ProductDTO updateImageUrl(Long id, String imageUrl) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setImageUrl(imageUrl);
        return mapToDTO(productRepository.save(product));
    }

    // ==============================
    // Compare 2-3 products side by side
    // ==============================
    @Override
    public ComparisonDTO compareProducts(List<Long> ids) {
        if (ids == null || ids.size() < 2 || ids.size() > 3) {
            throw new IllegalArgumentException("Select 2 to 3 products to compare.");
        }

        List<Product> products = new ArrayList<>();
        for (Long id : ids) {
            products.add(productRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id)));
        }

        double minPrice = products.stream().mapToDouble(Product::getPrice).min().orElse(0);
        double maxPrice = products.stream().mapToDouble(Product::getPrice).max().orElse(1);

        double bestPrice   = products.stream().mapToDouble(Product::getPrice).min().getAsDouble();
        double bestRating  = products.stream().mapToDouble(Product::getRating).max().getAsDouble();
        int    bestMah     = products.stream().mapToInt(p -> extractMah(p.getBattery())).max().getAsInt();

        Product overallBest = products.stream()
                .max(Comparator.comparingDouble(p -> recommendationEngineService
                        .score(p, maxPrice, minPrice).getOverallAiScore()))
                .get();

        List<ComparisonItem> items = products.stream()
                .map(p -> new ComparisonItem(
                        mapToDTO(p),
                        p.getPrice() == bestPrice,
                        p.getRating() == bestRating,
                        extractMah(p.getBattery()) == bestMah,
                        p.getId().equals(overallBest.getId())))
                .collect(Collectors.toList());

        return new ComparisonDTO(items, overallBest.getName());
    }

    // ==============================
    // Extract mAh number from battery string ("5910mAh" → 5910)
    // ==============================
    private int extractMah(String battery) {
        if (battery == null) return 0;
        Matcher m = MAH_PATTERN.matcher(battery);
        return m.find() ? Integer.parseInt(m.group()) : 0;
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
