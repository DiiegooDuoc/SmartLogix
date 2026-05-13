package com.smartlogix.store.bff.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/logistics")
@CrossOrigin(origins = "*") 
public class BffController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/status")
    public Map<String, String> getStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("system", "SmartLogix Online");
        status.put("group", "com.smartlogix.store");
        return status;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Object inventory = restTemplate.getForObject("http://localhost:8080/products", Object.class);
            response.put("inventory", inventory != null ? inventory : new ArrayList<>());
        } catch (Exception e) {
            response.put("inventory", new ArrayList<>()); 
        }

        try {
            Object orders = restTemplate.getForObject("http://localhost:8082/orders", Object.class);
            response.put("orders", orders != null ? orders : new ArrayList<>());
        } catch (Exception e) {
            response.put("orders", new ArrayList<>());
        }

        return response;
    }

    // --- SECCIÓN DE AUTENTICACIÓN ---
    @PostMapping("/auth/login")
    public Object login(@RequestBody Object credentials) {
        return restTemplate.postForObject("http://localhost:8083/auth/login", credentials, Object.class);
    }

    // --- SECCIÓN DE INVENTARIO (ADMIN) ---
    
    // Crear producto
    @PostMapping("/inventory")
    public Object addProduct(@RequestBody Object product) {
        return restTemplate.postForObject("http://localhost:8080/products", product, Object.class);
    }

    // Editar producto
    @PutMapping("/inventory/{id}")
    public Object updateProduct(@PathVariable Long id, @RequestBody Object product) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(product, headers);
        ResponseEntity<Object> response = restTemplate.exchange(
                "http://localhost:8080/products/" + id,
                HttpMethod.PUT,
                entity,
                Object.class
        );
        return response.getBody();
    }

    // Eliminar producto
    @DeleteMapping("/inventory/{id}")
    public void deleteProduct(@PathVariable Long id) {
        restTemplate.delete("http://localhost:8080/products/" + id);
    }

    // --- SECCIÓN DE ÓRDENES (CLIENTE / COMPRA) ---
    
    @PostMapping("/orders")
    public Object addOrder(@RequestBody Object order) {
        // Redirige la compra al microservicio de Órdenes (8082)
        return restTemplate.postForObject("http://localhost:8082/orders", order, Object.class);
    }

    // Admin: actualizar estado de una orden
    @PutMapping("/orders/{id}/status")
    public Object updateOrderStatus(@PathVariable Long id, @RequestBody Object statusUpdate) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(statusUpdate, headers);
        ResponseEntity<Object> response = restTemplate.exchange(
                "http://localhost:8082/orders/" + id + "/status",
                HttpMethod.PUT,
                entity,
                Object.class
        );
        return response.getBody();
    }
}