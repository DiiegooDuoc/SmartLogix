package com.smartlogix.store.orders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@SpringBootApplication
@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class OrdersApplication {

    private final OrderRepository repository;

    public OrdersApplication(OrderRepository repository) {
        this.repository = repository;
    }

    public static void main(String[] args) {
        SpringApplication.run(OrdersApplication.class, args);
    }

    @GetMapping
    public List<PurchaseOrder> getOrders() {
        return repository.findAll();
    }

    @PostMapping
    public PurchaseOrder addOrder(@RequestBody PurchaseOrder order) {
        return repository.save(order);
    }

    @PutMapping("/{id}/status")
    public PurchaseOrder updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusUpdate request) {
        Optional<PurchaseOrder> existing = repository.findById(id);
        PurchaseOrder order = existing.orElseThrow(() -> new OrderNotFoundException(id));
        order.setStatus(OrderStatus.fromWireValue(request.getStatus()).name());
        return repository.save(order);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(Long id) {
            super("Order not found: " + id);
        }
    }
}

@Entity
class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String customerName;
    private String productName;
    private Double totalAmount;

    private LocalDateTime createdAt;
    private String status;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = OrderStatus.EN_PROCESO.name();
        }
    }

   // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

class OrderStatusUpdate {
    private String status;
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

enum OrderStatus {
    EN_PROCESO,
    ENTREGADO,
    CANCELADO;

    static OrderStatus fromWireValue(String value) {
        if (value == null) return EN_PROCESO;
        String normalized = value.trim().toUpperCase();
        // Permite valores desde UI en español o ya normalizados
        return switch (normalized) {
            case "EN_PROCESO", "EN PROCESO", "PROCESO" -> EN_PROCESO;
            case "ENTREGADO" -> ENTREGADO;
            case "CANCELADO" -> CANCELADO;
            default -> EN_PROCESO;
        };
    }
}

@Repository
interface OrderRepository extends JpaRepository<PurchaseOrder, Long> { }