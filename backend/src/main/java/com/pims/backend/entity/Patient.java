package com.pims.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.pims.backend.enums.Sex;
import com.pims.backend.enums.Species;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String breed;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "microchip_number", unique = true, length = 15)
    private String microchipNumber;

    @Column(name = "microchip_date")
    private LocalDate microchipDate;

    @Column(name = "is_sterilized")
    private Boolean isSterilized;

    @Column(name = "sterilization_date")
    private LocalDate sterilizationDate;

    private Float weight;

    @Builder.Default
    @Column(name = "is_deceased")
    private Boolean isDeceased = false;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Species species;

    @Enumerated(EnumType.STRING)
    private Sex sex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonBackReference
    @ToString.Exclude
    private Client owner;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Alert> alerts = new ArrayList<>();
}
