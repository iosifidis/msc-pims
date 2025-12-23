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
    private String address;
    private Boolean gdprConsent;
    
    // Initial Pet fields (optional)
    private String petName;
    private String petSpecies; // DOG, CAT, RABBIT, BIRD, OTHER
    private String petBreed;
    private String petSex; // MALE, FEMALE
}
