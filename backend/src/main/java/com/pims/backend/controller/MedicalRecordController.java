package com.pims.backend.controller;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.entity.Appointment;
import com.pims.backend.entity.MedicalRecord;
import com.pims.backend.enums.AppointmentStatus;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.MedicalRecordRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<MedicalRecord> createMedicalRecord(@RequestBody MedicalRecordRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        MedicalRecord medicalRecord = MedicalRecord.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .weight(request.getWeight())
                .temperature(request.getTemperature())
                .symptoms(request.getSymptoms())
                .diagnosis(request.getDiagnosis())
                .treatment(request.getTreatment())
                .createdAt(LocalDateTime.now())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);

        // Automatically set the Appointment Status to COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(savedRecord);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<MedicalRecord> updateMedicalRecord(@PathVariable Long id, @RequestBody MedicalRecordRequest request) {
        return medicalRecordRepository.findById(id)
                .map(record -> {
                    if (request.getWeight() != null) record.setWeight(request.getWeight());
                    if (request.getTemperature() != null) record.setTemperature(request.getTemperature());
                    if (request.getSymptoms() != null) record.setSymptoms(request.getSymptoms());
                    if (request.getDiagnosis() != null) record.setDiagnosis(request.getDiagnosis());
                    if (request.getTreatment() != null) record.setTreatment(request.getTreatment());
                    
                    MedicalRecord saved = medicalRecordRepository.save(record);
                    
                    // Force initialization of Appointment for response (since it's Lazy)
                    if (saved.getAppointment() != null) {
                        saved.getAppointment().getStatus();
                    }
                    
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/appointment/{appointmentId}")
    @Transactional
    public ResponseEntity<MedicalRecord> getByAppointmentId(@PathVariable Long appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId)
                .map(record -> {
                    // Force initialization of Appointment
                    if (record.getAppointment() != null) {
                        record.getAppointment().getStatus();
                    }
                    return ResponseEntity.ok(record);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    @Transactional
    public List<MedicalRecord> getByPatientId(@PathVariable Long patientId) {
        List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId);
        
        // Sort by CreatedAt DESC (Newest first)
        records.sort(Comparator.comparing(MedicalRecord::getCreatedAt).reversed());
        
        // Force initialization of Appointment for each record to ensure JSON includes it
        records.forEach(record -> {
            if (record.getAppointment() != null) {
                record.getAppointment().getStatus();
            }
        });
        
        return records;
    }

    @Data
    public static class MedicalRecordRequest {
        private Long appointmentId;
        private Double weight;
        private Double temperature;
        private String symptoms;
        private String diagnosis;
        private String treatment;
    }
}
