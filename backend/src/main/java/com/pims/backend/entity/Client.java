package com.pims.backend.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true)
    private String afm;

    private String adt;

    @JsonProperty("phoneNumber") // Serialize as phoneNumber for frontend compatibility
    private String phone;

    private String address;

    @Column(name = "gdpr_consent")
    private Boolean gdprConsent;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @PrePersist
    public void prePersist() {
        if (balance == null) {
            balance = BigDecimal.ZERO;
        }
    }

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @JsonManagedReference
    @ToString.Exclude
    private List<Patient> pets = new ArrayList<>();

    public void addPatient(Patient patient) {
        pets.add(patient);
        patient.setOwner(this);
    }

    public void removePatient(Patient patient) {
        pets.remove(patient);
        patient.setOwner(null);
    }

    @JsonProperty("petCount")
    public int getPetCount() {
        return pets != null ? pets.size() : 0;
    }
}
