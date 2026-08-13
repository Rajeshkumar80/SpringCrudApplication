package com.example.Product.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService newService() {
        return new FileStorageService(tempDir.toString());
    }

    @Test
    void store_validJpegReturnsServedUrlAndWritesFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "phone.jpg", "image/jpeg", new byte[]{1, 2, 3});

        String url = newService().store(file);

        assertTrue(url.matches("/uploads/products/[0-9a-f-]+\\.jpg"));
        Path stored = tempDir.resolve(Path.of(url).getFileName().toString());
        assertTrue(Files.exists(stored));
        assertArrayEquals(new byte[]{1, 2, 3}, Files.readAllBytes(stored));
    }

    @Test
    void store_emptyFileIsRejected() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]);

        assertThrows(IllegalArgumentException.class, () -> newService().store(file));
    }

    @Test
    void store_oversizedFileIsRejected() {
        byte[] big = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "big.jpg", "image/jpeg", big);

        assertThrows(IllegalArgumentException.class, () -> newService().store(file));
    }

    @Test
    void store_wrongMimeIsRejected() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "notes.txt", "text/plain", "hello".getBytes());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> newService().store(file));
        assertEquals("Only JPEG, PNG and WEBP images are allowed", ex.getMessage());
    }

    @Test
    void store_pngIsAcceptedWithPngExtension() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "img.png", "image/png", new byte[]{9});

        String url = newService().store(file);

        assertTrue(url.endsWith(".png"));
    }
}
