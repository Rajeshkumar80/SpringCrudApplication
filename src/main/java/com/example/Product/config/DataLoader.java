package com.example.Product.config;

import com.example.Product.model.Product;
import com.example.Product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ProductRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                System.out.println("=== Database already seeded. Skipping. ===");
                return;
            }

            // ─── Apple ────────────────────────────────────────
            repository.save(new Product(null, "iPhone 16", "Apple", 79999,
                    "Apple A18", "8GB", "256GB", "4685mAh",
                    "48MP + 12MP Dual", "6.1\" Super Retina XDR OLED", 4.8, 15,
                    "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-1.jpg"));

            repository.save(new Product(null, "iPhone 16 Pro Max", "Apple", 134900,
                    "Apple A18 Pro", "8GB", "512GB", "4685mAh",
                    "48MP + 12MP + 12MP Triple", "6.9\" Super Retina XDR OLED", 4.9, 10,
                    "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-1.jpg"));

            repository.save(new Product(null, "iPhone 15", "Apple", 69999,
                    "Apple A16 Bionic", "6GB", "128GB", "4383mAh",
                    "48MP + 12MP Dual", "6.1\" Super Retina XDR OLED", 4.7, 20,
                    "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg"));

            // ─── Samsung ──────────────────────────────────────
            repository.save(new Product(null, "Galaxy S25 Ultra", "Samsung", 129999,
                    "Snapdragon 8 Elite", "12GB", "512GB", "5000mAh",
                    "200MP + 50MP + 10MP + 12MP Quad", "6.9\" Dynamic AMOLED 2X 120Hz", 4.9, 8,
                    "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s25-ultra-1.jpg"));

            repository.save(new Product(null, "Galaxy S25+", "Samsung", 99999,
                    "Snapdragon 8 Elite", "12GB", "256GB", "4900mAh",
                    "50MP + 10MP + 12MP Triple", "6.7\" Dynamic AMOLED 2X 120Hz", 4.8, 12,
                    "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s25-1.jpg"));

            repository.save(new Product(null, "Galaxy A56 5G", "Samsung", 39999,
                    "Exynos 1580", "8GB", "256GB", "5000mAh",
                    "50MP + 12MP + 5MP Triple", "6.7\" Super AMOLED 120Hz", 4.5, 25,
                    "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a56-1.jpg"));

            // ─── Google ───────────────────────────────────────
            repository.save(new Product(null, "Pixel 9 Pro", "Google", 109999,
                    "Google Tensor G4", "16GB", "256GB", "5060mAh",
                    "50MP + 48MP + 48MP Triple", "6.3\" LTPO OLED 120Hz", 4.8, 9,
                    "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9-pro-1.jpg"));

            repository.save(new Product(null, "Pixel 9a", "Google", 49999,
                    "Google Tensor G4", "8GB", "128GB", "5100mAh",
                    "48MP + 13MP Dual", "6.3\" OLED 120Hz", 4.5, 18,
                    "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9a-1.jpg"));

            // ─── OnePlus ──────────────────────────────────────
            repository.save(new Product(null, "OnePlus 13", "OnePlus", 69999,
                    "Snapdragon 8 Elite", "16GB", "512GB", "6000mAh",
                    "50MP + 50MP + 50MP Triple (Hasselblad)", "6.82\" LTPO AMOLED 120Hz", 4.9, 16,
                    "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-13-1.jpg"));

            repository.save(new Product(null, "OnePlus Nord 4", "OnePlus", 29999,
                    "Snapdragon 7+ Gen 3", "8GB", "256GB", "5500mAh",
                    "50MP + 8MP Dual", "6.74\" AMOLED 120Hz", 4.4, 30,
                    "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-4-1.jpg"));

            // ─── Nothing ──────────────────────────────────────
            repository.save(new Product(null, "Nothing Phone (3)", "Nothing", 59999,
                    "Snapdragon 8s Gen 4", "12GB", "256GB", "5150mAh",
                    "50MP + 50MP + 50MP Triple", "6.77\" LTPO AMOLED 120Hz", 4.7, 14,
                    "https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone-3-1.jpg"));

            repository.save(new Product(null, "CMF Phone 2 Pro", "Nothing", 22999,
                    "Dimensity 7300 Pro", "8GB", "128GB", "5000mAh",
                    "50MP + 2MP Dual", "6.77\" AMOLED 120Hz", 4.4, 22,
                    "https://fdn2.gsmarena.com/vv/pics/nothing/nothing-cmf-phone-2-pro-1.jpg"));

            // ─── Motorola ─────────────────────────────────────
            repository.save(new Product(null, "Moto Edge 60 Pro", "Motorola", 39999,
                    "Snapdragon 8s Gen 3", "12GB", "256GB", "5500mAh",
                    "50MP + 13MP + 10MP Triple", "6.7\" pOLED 144Hz", 4.6, 18,
                    "https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-60-pro-1.jpg"));

            // ─── Realme ───────────────────────────────────────
            repository.save(new Product(null, "Realme GT 7 Pro", "Realme", 49999,
                    "Snapdragon 8 Elite", "12GB", "256GB", "7000mAh",
                    "50MP + 8MP + 2MP Triple", "6.78\" AMOLED 120Hz", 4.7, 17,
                    "https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-7-pro-1.jpg"));

            repository.save(new Product(null, "Realme P3 Pro", "Realme", 24999,
                    "Snapdragon 7s Gen 3", "8GB", "256GB", "6000mAh",
                    "50MP + 2MP Dual", "6.7\" AMOLED 120Hz", 4.4, 28,
                    "https://fdn2.gsmarena.com/vv/pics/realme/realme-p3-pro-1.jpg"));

            // ─── Vivo ─────────────────────────────────────────
            repository.save(new Product(null, "Vivo X200 Pro", "Vivo", 89999,
                    "Dimensity 9400", "16GB", "512GB", "6000mAh",
                    "50MP + 200MP + 50MP Triple (ZEISS)", "6.78\" LTPO AMOLED 120Hz", 4.8, 11,
                    "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x200-pro-1.jpg"));

            repository.save(new Product(null, "Vivo V50", "Vivo", 34999,
                    "Snapdragon 7 Gen 3", "8GB", "256GB", "6000mAh",
                    "50MP + 50MP Dual (ZEISS)", "6.77\" AMOLED 120Hz", 4.5, 20,
                    "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v50-1.jpg"));

            // ─── Oppo ─────────────────────────────────────────
            repository.save(new Product(null, "OPPO Find X8 Pro", "Oppo", 99999,
                    "Dimensity 9400", "16GB", "512GB", "5910mAh",
                    "50MP + 50MP + 50MP Triple (Hasselblad)", "6.78\" LTPO AMOLED 120Hz", 4.8, 9,
                    "https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x8-pro-1.jpg"));

            repository.save(new Product(null, "OPPO Reno 13 Pro", "Oppo", 44999,
                    "Dimensity 8350", "12GB", "256GB", "5600mAh",
                    "50MP + 8MP + 2MP Triple", "6.83\" AMOLED 120Hz", 4.5, 20,
                    "https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno13-pro-1.jpg"));

            // ─── Xiaomi ───────────────────────────────────────
            repository.save(new Product(null, "Xiaomi 15 Pro", "Xiaomi", 74999,
                    "Snapdragon 8 Elite", "16GB", "512GB", "6100mAh",
                    "50MP + 50MP + 50MP Triple (Leica)", "6.73\" LTPO AMOLED 120Hz", 4.8, 13,
                    "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-15-pro-1.jpg"));

            repository.save(new Product(null, "Redmi Note 14 Pro+", "Xiaomi", 32999,
                    "Snapdragon 7s Gen 3", "8GB", "256GB", "5110mAh",
                    "200MP + 8MP + 2MP Triple", "6.67\" AMOLED 120Hz", 4.5, 35,
                    "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-14-pro-plus-1.jpg"));

            // ─── POCO ─────────────────────────────────────────
            repository.save(new Product(null, "POCO F7 Pro", "POCO", 39999,
                    "Snapdragon 8s Gen 4", "12GB", "256GB", "6000mAh",
                    "50MP + 8MP + 2MP Triple", "6.67\" AMOLED 144Hz", 4.6, 24,
                    "https://fdn2.gsmarena.com/vv/pics/poco/poco-f7-pro-1.jpg"));

            // ─── iQOO ─────────────────────────────────────────
            repository.save(new Product(null, "iQOO 13", "iQOO", 54999,
                    "Snapdragon 8 Elite", "12GB", "256GB", "6150mAh",
                    "50MP + 50MP + 50MP Triple", "6.82\" LTPO AMOLED 144Hz", 4.8, 20,
                    "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-13-1.jpg"));

            repository.save(new Product(null, "iQOO Z10 Turbo", "iQOO", 23999,
                    "Snapdragon 7 Gen 3", "8GB", "256GB", "6500mAh",
                    "50MP + 2MP Dual", "6.67\" AMOLED 120Hz", 4.5, 28,
                    "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-z10-turbo-1.jpg"));

            // ─── ASUS ─────────────────────────────────────────
            repository.save(new Product(null, "ASUS ROG Phone 9 Pro", "ASUS", 109999,
                    "Snapdragon 8 Elite", "24GB", "1TB", "6000mAh",
                    "50MP + 13MP + 5MP Triple", "6.78\" AMOLED 185Hz", 4.9, 6,
                    "https://fdn2.gsmarena.com/vv/pics/asus/asus-rog-phone-9-pro-1.jpg"));

            // ─── Honor ────────────────────────────────────────
            repository.save(new Product(null, "Honor Magic 7 Pro", "Honor", 74999,
                    "Snapdragon 8 Elite", "12GB", "512GB", "5270mAh",
                    "50MP + 200MP + 40MP Triple", "6.8\" LTPO OLED 120Hz", 4.7, 10,
                    "https://fdn2.gsmarena.com/vv/pics/honor/honor-magic7-pro-1.jpg"));

            // ─── Sony ─────────────────────────────────────────
            repository.save(new Product(null, "Sony Xperia 1 VI", "Sony", 119999,
                    "Snapdragon 8 Gen 3", "12GB", "512GB", "5000mAh",
                    "52MP + 12MP + 12MP Triple (Zeiss)", "6.5\" 4K OLED 120Hz", 4.6, 5,
                    "https://fdn2.gsmarena.com/vv/pics/sony/sony-xperia-1-vi-1.jpg"));

            // ─── Nokia ────────────────────────────────────────
            repository.save(new Product(null, "Nokia XR21", "Nokia", 44999,
                    "Snapdragon 7 Gen 1", "6GB", "128GB", "4800mAh",
                    "64MP + 8MP Dual", "6.49\" IPS LCD 120Hz", 4.3, 12,
                    "https://fdn2.gsmarena.com/vv/pics/nokia/nokia-xr21-1.jpg"));

            // ─── Lava ─────────────────────────────────────────
            repository.save(new Product(null, "Lava Agni 3", "Lava", 19999,
                    "Dimensity 7300", "8GB", "128GB", "5000mAh",
                    "64MP + 8MP + 2MP Triple", "6.78\" AMOLED 144Hz", 4.3, 15,
                    "https://fdn2.gsmarena.com/vv/pics/lava/lava-agni-3-1.jpg"));

            // ─── Extra high-end ───────────────────────────────
            repository.save(new Product(null, "Samsung Galaxy Z Fold 6", "Samsung", 164999,
                    "Snapdragon 8 Gen 3", "12GB", "512GB", "4400mAh",
                    "50MP + 12MP + 10MP Triple", "7.6\" Dynamic AMOLED 2X 120Hz (Main)", 4.7, 5,
                    "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold6-1.jpg"));

            System.out.println("========================================");
            System.out.println("  30 Mobile Products Loaded Successfully");
            System.out.println("========================================");
        };
    }
}
