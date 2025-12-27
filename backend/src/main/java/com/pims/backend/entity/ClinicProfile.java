package com.pims.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "clinic_profiles")
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

    public ClinicProfile() {
    }

    public ClinicProfile(Long id, String businessName, String vatNumber, String address, String phone, String email, String logoUrl) {
        this.id = id;
        this.businessName = businessName;
        this.vatNumber = vatNumber;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.logoUrl = logoUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getVatNumber() {
        return vatNumber;
    }

    public void setVatNumber(String vatNumber) {
        this.vatNumber = vatNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
