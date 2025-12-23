package com.pims.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String subjective;

    @Column(columnDefinition = "TEXT")
    private String objective;

    @Column(columnDefinition = "TEXT")
    private String assessment;

    @Column(columnDefinition = "TEXT")
    private String plan;

    // Vital Signs Fields
    @Column(name = "weight")
    private Double weight; // in Kg

    @Column(name = "temperature")
    private Double temperature; // in Celsius

    @Column(name = "heart_rate")
    private Integer heartRate; // in bpm

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate; // in bpm

    @Column(name = "mucous_membranes")
    private String mucousMembranes; // e.g., "Pink", "Pale"

    @Column(name = "crt")
    private Double crt; // Capillary Refill Time in seconds

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
