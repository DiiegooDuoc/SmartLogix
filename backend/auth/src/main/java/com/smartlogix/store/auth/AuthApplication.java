package com.smartlogix.store.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.*;
import java.util.Optional;

@SpringBootApplication
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthApplication {

    private final UserRepository repository;

    public AuthApplication(UserRepository repository) {
        this.repository = repository;
    }

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

    @PostMapping("/login")
    public User login(@RequestBody User credentials) {
        return repository.findByEmail(credentials.getEmail())
                .filter(u -> u.getPassword().equals(credentials.getPassword()))
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));
    }

    // Esto crea los usuarios apenas arranca el programa si la BD está vacía
    @Bean
    CommandLineRunner init(UserRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new User(null, "admin@smart.com", "admin123", "ADMIN"));
                repo.save(new User(null, "cliente@gmail.com", "user123", "CLIENTE"));
                repo.save(new User(null, "diego@gmail.com", "diego123", "CLIENTE"));
                repo.save(new User(null, "antoane@gmail.com", "antoane123", "CLIENTE"));
                System.out.println("--- Usuarios de prueba creados ---");
            }
        };
    }
}

@Entity
@Table(name = "users")
class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String password;
    private String role;

    public User() {}
    public User(Long id, String email, String password, String role) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
}

@Repository
interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}