package com.example.Product.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Stores product images under the configured upload directory.
 * Only jpeg/png/webp are accepted and files are capped at 5MB.
 * Returns the relative URL used to serve the file.
 */
@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/webp");
    private static final Map<String, String> MIME_TO_EXT = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp");

    private final Path root;

    public FileStorageService(@Value("${file.upload-dir:uploads/products}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + root, e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds the 5MB size limit");
        }

        String mime = file.getContentType();
        if (mime == null || !ALLOWED_MIME.contains(mime.toLowerCase())) {
            throw new IllegalArgumentException("Only JPEG, PNG and WEBP images are allowed");
        }

        String filename = UUID.randomUUID() + "." + MIME_TO_EXT.get(mime.toLowerCase());
        Path target = root.resolve(filename);
        try {
            file.transferTo(target);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file: " + filename, e);
        }
        return "/uploads/products/" + filename;
    }
}
