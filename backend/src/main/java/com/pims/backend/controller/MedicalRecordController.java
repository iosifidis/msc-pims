package com.pims.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.dto.MedicalRecordRequest;
import com.pims.backend.entity.Appointment;
import com.pims.backend.entity.MedicalRecord;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.MedicalRecordRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;

    @PostMapping
    public MedicalRecord createOrUpdateMedicalRecord(@RequestBody MedicalRecordRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Optional<MedicalRecord> existingRecord = medicalRecordRepository.findByAppointmentId(request.getAppointmentId());

        MedicalRecord medicalRecord;
        if (existingRecord.isPresent()) {
            medicalRecord = existingRecord.get();
            medicalRecord.setSubjective(request.getSubjective());
            medicalRecord.setObjective(request.getObjective());
            medicalRecord.setAssessment(request.getAssessment());
            medicalRecord.setPlan(request.getPlan());
        } else {
            medicalRecord = MedicalRecord.builder()
                    .appointment(appointment)
                    .subjective(request.getSubjective())
                    .objective(request.getObjective())
                    .assessment(request.getAssessment())
                    .plan(request.getPlan())
                    .build();
        }

        return medicalRecordRepository.save(medicalRecord);
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<MedicalRecord> getMedicalRecordByAppointment(@PathVariable Long appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<MedicalRecord> getAllMedicalRecords(@RequestParam(required = false) Long patientId) {
        if (patientId != null) {
            return medicalRecordRepository.findByAppointment_PatientIdOrderByCreatedAtDesc(patientId);
        }
        return medicalRecordRepository.findAll();
    }
}
