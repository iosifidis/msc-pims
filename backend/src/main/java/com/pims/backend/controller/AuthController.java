package com.pims.backend.controller;

import com.pims.backend.entity.AppUser;
import com.pims.backend.entity.Role;
import com.pims.backend.repository.AppUserRepository;
import com.pims.backend.repository.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository appUserRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register/vet")
    public ResponseEntity<?> registerVet(@RequestBody RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        Role role = roleRepository.findByName("VET")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("VET");
                    return roleRepository.save(newRole);
                });

        // Create new user instance and set fields manually
        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        appUserRepository.save(user);

        return ResponseEntity.ok("Vet registered successfully!");
    }

    // Assuming a DTO class exists for the request body
    // If this class is defined in a separate file, you can remove this inner class.
    public static class RegisterRequest {
        private String username;
        private String password;
        // private String email;
        // private String fullName;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
