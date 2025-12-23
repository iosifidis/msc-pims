package com.pims.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.entity.Patient;
import com.pims.backend.repository.PatientRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;

    /**
     * Get all patients
     */
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    /**
     * Get patient by ID
     */
    @GetMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all patients by client/owner ID
     * GET /api/patients/client/{clientId}
     */
    @GetMapping("/client/{clientId}")
    public List<Patient> getPatientsByClientId(@PathVariable Long clientId) {
        return patientRepository.findByClientId(clientId);
    }

    /**
     * Update patient status (deceased)
     * PUT /api/patients/{id}/status
     */
    @PutMapping("/{id}/status")
    @SuppressWarnings("null")
    public ResponseEntity<Patient> updatePatientStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        
        patient.setIsDeceased(request.getIsDeceased());
        Patient updatedPatient = patientRepository.save(patient);
        
        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * Inner DTO for status update
     */
    public static class StatusRequest {
        private Boolean isDeceased;

        public Boolean getIsDeceased() {
            return isDeceased;
        }

        public void setIsDeceased(Boolean isDeceased) {
            this.isDeceased = isDeceased;
        }
    }
}
