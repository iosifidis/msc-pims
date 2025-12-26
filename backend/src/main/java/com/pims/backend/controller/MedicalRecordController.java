package com.pims.backend.controller;

import com.pims.backend.entity.Appointment;
import com.pims.backend.entity.MedicalRecord;
import com.pims.backend.enums.AppointmentStatus;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public MedicalRecordController(MedicalRecordRepository medicalRecordRepository, AppointmentRepository appointmentRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByClient(@PathVariable Long clientId) {
        List<MedicalRecord> records = medicalRecordRepository.findByClientId(clientId);
        return ResponseEntity.ok(records);
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> createMedicalRecord(@RequestBody MedicalRecord medicalRecord, @RequestParam Long appointmentId) {
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Link appointment to medical record before saving
        medicalRecord.setAppointment(appointment);
        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(savedRecord);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByPatient(@PathVariable Long patientId) {
        List<MedicalRecord> records = medicalRecordRepository.findByPatientId(patientId);
        return ResponseEntity.ok(records);
    }
}