package com.pims.backend.dto;

import lombok.Data;

@Data
public class ClientRequest {
    // Client fields
    private String firstName;
    private String lastName;
    private String email;
    private String afm;
    private String adt;
    private String phone;
    private String phoneNumber; // Alternative field name from frontend
    private String address;
    private Boolean gdprConsent;
    
    // Helper method to get phone regardless of which field was sent
    public String getPhoneValue() {
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return phoneNumber;
        }
        return phone;
    }
    
    // Initial Pet fields (optional)
    private String petName;
    private String petSpecies; // DOG, CAT, RABBIT, BIRD, OTHER
    private String petBreed;
    private String petSex; // MALE, FEMALE
}
