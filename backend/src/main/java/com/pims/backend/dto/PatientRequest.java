package com.pims.backend.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class PatientRequest {
    private String name;
    private String species; // DOG, CAT, RABBIT, BIRD, OTHER
    private String breed;
    private String sex; // MALE, FEMALE
    private LocalDate birthDate;
    private String microchipNumber;
    private LocalDate microchipDate;
    private Boolean isSterilized;
    private LocalDate sterilizationDate;
    private Float weight;
    private Boolean isDeceased;
}
