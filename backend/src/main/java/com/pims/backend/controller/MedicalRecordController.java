package com.pims.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
import com.pims.backend.entity.Invoice;
import com.pims.backend.entity.MedicalRecord;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.InvoiceRepository;
import com.pims.backend.repository.MedicalRecordRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;

    @PostMapping
    @SuppressWarnings("null")
    public MedicalRecord createOrUpdateMedicalRecord(@RequestBody MedicalRecordRequest request) {
        // Step 1: Find Appointment by ID
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Step 2: Create or Update MedicalRecord
        Optional<MedicalRecord> existingRecord = medicalRecordRepository.findByAppointmentId(request.getAppointmentId());

        MedicalRecord medicalRecord;
        if (existingRecord.isPresent()) {
            // Update existing record
            medicalRecord = existingRecord.get();
            medicalRecord.setSubjective(request.getSubjective());
            medicalRecord.setObjective(request.getObjective());
            medicalRecord.setAssessment(request.getAssessment());
            medicalRecord.setPlan(request.getPlan());
            // Update vital signs
            medicalRecord.setWeight(request.getWeight());
            medicalRecord.setTemperature(request.getTemperature());
            medicalRecord.setHeartRate(request.getHeartRate());
            medicalRecord.setRespiratoryRate(request.getRespiratoryRate());
            medicalRecord.setMucousMembranes(request.getMucousMembranes());
            medicalRecord.setCrt(request.getCrt());
        } else {
            // Create new record - linked to Appointment (which contains Patient reference)
            medicalRecord = MedicalRecord.builder()
                    .appointment(appointment)
                    .subjective(request.getSubjective())
                    .objective(request.getObjective())
                    .assessment(request.getAssessment())
                    .plan(request.getPlan())
                    // Vital signs
                    .weight(request.getWeight())
                    .temperature(request.getTemperature())
                    .heartRate(request.getHeartRate())
                    .respiratoryRate(request.getRespiratoryRate())
                    .mucousMembranes(request.getMucousMembranes())
                    .crt(request.getCrt())
                    .build();
        }

        // Step 3: Save MedicalRecord
        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);

        // Step 4: Invoice Logic - Auto-generate if cost is provided and > 0
        if (request.getCost() != null && request.getCost().compareTo(BigDecimal.ZERO) > 0) {
            // Check if invoice already exists for this appointment
            Optional<Invoice> existingInvoice = invoiceRepository.findByAppointmentId(appointment.getId());
            
            if (existingInvoice.isEmpty()) {
                // Create Invoice entity
                Invoice invoice = Invoice.builder()
                        .appointment(appointment)  // Appointment contains Client reference
                        .amount(request.getCost())
                        .status("PAID")
                        .issuedAt(LocalDateTime.now())
                        .build();
                
                // Save Invoice
                invoiceRepository.save(invoice);
            }
        }

        return savedRecord;
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<MedicalRecord> getMedicalRecordByAppointment(@PathVariable Long appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getMedicalRecordsByPatient(@PathVariable Long patientId) {
        return medicalRecordRepository.findByAppointment_Patient_IdOrderByCreatedAtDesc(patientId);
    }

    /**
     * Get all medical records for patients owned by a specific client
     * GET /api/medical-records/owner/{ownerId}
     */
    @GetMapping("/owner/{ownerId}")
    public List<MedicalRecord> getMedicalRecordsByOwnerId(@PathVariable Long ownerId) {
        return medicalRecordRepository.findByAppointment_Patient_Owner_IdOrderByCreatedAtDesc(ownerId);
    }

    @GetMapping
    public List<MedicalRecord> getAllMedicalRecords(@RequestParam(required = false) Long patientId) {
        if (patientId != null) {
            return medicalRecordRepository.findByAppointment_PatientIdOrderByCreatedAtDesc(patientId);
        }
        return medicalRecordRepository.findAll();
    }
}
