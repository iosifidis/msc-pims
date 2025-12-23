package com.pims.backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class MedicalRecordRequest {
    private Long appointmentId;
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;
    private BigDecimal cost;
    
    // Vital Signs Fields
    private Double weight; // in Kg
    private Double temperature; // in Celsius
    private Integer heartRate; // in bpm
    private Integer respiratoryRate; // in bpm
    private String mucousMembranes; // e.g., "Pink", "Pale"
    private Double crt; // Capillary Refill Time in seconds
}
