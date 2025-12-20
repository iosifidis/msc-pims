package com.pims.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clinic_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "vat_number")
    private String vatNumber;

    private String address;

    private String phone;

    private String email;

    @Column(name = "logo_url")
    private String logoUrl;
}
