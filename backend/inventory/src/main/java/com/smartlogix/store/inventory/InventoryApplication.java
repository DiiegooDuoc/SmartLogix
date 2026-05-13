package com.smartlogix.store.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.*;
import java.util.List;
import java.util.Optional;

@SpringBootApplication
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class InventoryApplication {

    private final ProductRepository repository;

    public InventoryApplication(ProductRepository repository) {
        this.repository = repository;
    }

    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
    }

    @GetMapping
    public List<Product> getProducts() {
        return repository.findAll();
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return repository.save(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product update) {
        Optional<Product> existing = repository.findById(id);
        Product product = existing.orElseThrow(() -> new ProductNotFoundException(id));

        if (update.getName() != null) {
            product.setName(update.getName());
        }
        if (update.getPrice() != null) {
            product.setPrice(update.getPrice());
        }
        if (update.getStock() != null) {
            product.setStock(update.getStock());
        }

        return repository.save(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    static class ProductNotFoundException extends RuntimeException {
        public ProductNotFoundException(Long id) {
            super("Product not found: " + id);
        }
    }
}

@Entity
class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double price;
    private Integer stock;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
}

@Repository
interface ProductRepository extends JpaRepository<Product, Long> { }