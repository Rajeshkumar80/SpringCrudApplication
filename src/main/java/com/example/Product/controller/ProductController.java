package com.example.Product.controller;

import com.example.Product.dto.ProductDTO;
import com.example.Product.service.FileStorageService;
import com.example.Product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    public ProductController(ProductService productService,
                             FileStorageService fileStorageService) {
        this.productService = productService;
        this.fileStorageService = fileStorageService;
    }

    // ==============================
    // GET All Products (no pagination)
    // ==============================
    @GetMapping("/all")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ==============================
    // GET Product by ID
    // ==============================
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // ==============================
    // POST Create Product
    // ==============================
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO created = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ==============================
    // PUT Update Product
    // ==============================
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {
        ProductDTO updated = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updated);
    }

    // ==============================
    // DELETE Product
    // ==============================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully.");
    }

    // ==============================
    // POST Upload Product Image (multipart, ADMIN only)
    // ==============================
    @PostMapping("/{id}/image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file);
        ProductDTO updated = productService.updateImageUrl(id, url);
        return ResponseEntity.ok(Map.of(
                "message", "Image uploaded successfully",
                "imageUrl", url,
                "product", updated));
    }

    // ==============================
    // GET Paginated + Sorted Products
    // ==============================
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                productService.getProductsPaged(page, size, sortBy, sortDir));
    }

    // ==============================
    // GET Search + Pagination + Sorting
    // ==============================
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(
                productService.searchProducts(keyword, page, size, sortBy, sortDir));
    }
}
