package com.pims.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.entity.AppUser;
import com.pims.backend.repository.AppUserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AppUserRepository appUserRepository;

    @GetMapping("/vets")
    public List<AppUser> getVets() {
        return appUserRepository.findAll().stream()
                .filter(user -> user.getRole() != null && "VET".equals(user.getRole().getName()))
                .collect(Collectors.toList());
    }
}
