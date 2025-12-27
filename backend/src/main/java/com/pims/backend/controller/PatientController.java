package com.pims.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.dto.PatientRequest;
import com.pims.backend.entity.Patient;
import com.pims.backend.enums.Sex;
import com.pims.backend.enums.Species;
import com.pims.backend.repository.PatientRepository;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

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
     * GET /api/patients/owner/{ownerId}
     */
    @GetMapping("/owner/{ownerId}")
    public List<Patient> getPatientsByOwnerId(@PathVariable Long ownerId) {
        return patientRepository.findByOwnerId(ownerId);
    }

    /**
     * Update patient (full update)
     * PUT /api/patients/{id}
     */
    @PutMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Patient> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientRequest request) {
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        
        // Update basic fields
        if (request.getName() != null) {
            patient.setName(request.getName());
        }
        if (request.getBreed() != null) {
            patient.setBreed(request.getBreed());
        }
        if (request.getBirthDate() != null) {
            patient.setBirthDate(request.getBirthDate());
        }
        if (request.getWeight() != null) {
            patient.setWeight(request.getWeight());
        }
        if (request.getIsDeceased() != null) {
            patient.setIsDeceased(request.getIsDeceased());
        }
        
        // Update microchip info
        if (request.getMicrochipNumber() != null) {
            patient.setMicrochipNumber(request.getMicrochipNumber());
        }
        if (request.getMicrochipDate() != null) {
            patient.setMicrochipDate(request.getMicrochipDate());
        }
        
        // Update sterilization info
        if (request.getIsSterilized() != null) {
            patient.setIsSterilized(request.getIsSterilized());
        }
        if (request.getSterilizationDate() != null) {
            patient.setSterilizationDate(request.getSterilizationDate());
        }
        
        // Parse and update species enum
        if (request.getSpecies() != null) {
            try {
                patient.setSpecies(Species.valueOf(request.getSpecies().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing if invalid
            }
        }
        
        // Parse and update sex enum
        if (request.getSex() != null) {
            try {
                patient.setSex(Sex.valueOf(request.getSex().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing if invalid
            }
        }
        
        Patient updatedPatient = patientRepository.save(patient);
        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * Delete patient
     * DELETE /api/patients/{id}
     */
    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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
