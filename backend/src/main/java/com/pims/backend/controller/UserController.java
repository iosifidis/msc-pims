package com.pims.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.entity.AppUser;
import com.pims.backend.repository.AppUserRepository;
import com.pims.backend.repository.RoleRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;

    public UserController(AppUserRepository appUserRepository, RoleRepository roleRepository) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
    }

    @GetMapping("/vets")
    public List<AppUser> getVets() {
        return appUserRepository.findAll().stream()
                .filter(user -> user.getRole() != null && "VET".equals(user.getRole().getName()))
                .collect(Collectors.toList());
    }
}
