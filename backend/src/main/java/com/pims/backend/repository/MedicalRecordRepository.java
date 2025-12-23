package com.pims.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pims.backend.entity.MedicalRecord;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);

    List<MedicalRecord> findByAppointment_PatientIdOrderByCreatedAtDesc(Long patientId);
    
    List<MedicalRecord> findByAppointment_Patient_IdOrderByCreatedAtDesc(Long patientId);
    
    // Find all medical records for patients owned by a specific client
    List<MedicalRecord> findByAppointment_Patient_Client_IdOrderByCreatedAtDesc(Long clientId);
}
