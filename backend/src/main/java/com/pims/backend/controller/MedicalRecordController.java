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
    public ResponseEntity<MedicalRecord> createMedicalRecord(@RequestBody MedicalRecordRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setAppointment(appointment);
        medicalRecord.setDiagnosis(request.getDiagnosis());
        medicalRecord.setTreatment(request.getTreatment());
        medicalRecord.setNotes(request.getNotes());
        medicalRecord.setPatient(appointment.getPatient());

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

    public static class MedicalRecordRequest {
        private Long appointmentId;
        private String diagnosis;
        private String treatment;
        private String notes;

        public Long getAppointmentId() { return appointmentId; }
        public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
        public String getDiagnosis() { return diagnosis; }
        public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
        public String getTreatment() { return treatment; }
        public void setTreatment(String treatment) { this.treatment = treatment; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}