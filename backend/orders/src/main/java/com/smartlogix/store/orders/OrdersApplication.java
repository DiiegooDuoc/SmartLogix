package com.smartlogix.store.orders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.*;
import java.util.List;

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
}

@Entity
class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String customerName;
    private String productName;
    private Double totalAmount;

   // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}

@Repository
interface OrderRepository extends JpaRepository<PurchaseOrder, Long> { }