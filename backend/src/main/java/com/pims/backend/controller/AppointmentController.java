package com.pims.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.dto.AppointmentRequest;
import com.pims.backend.entity.AppUser;
import com.pims.backend.entity.Appointment;
import com.pims.backend.entity.Client;
import com.pims.backend.entity.Patient;
import com.pims.backend.entity.Resource;
import com.pims.backend.enums.AppointmentStatus;
import com.pims.backend.repository.AppUserRepository;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.ClientRepository;
import com.pims.backend.repository.PatientRepository;
import com.pims.backend.repository.ResourceRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final PatientRepository patientRepository;
    private final AppUserRepository appUserRepository;
    private final ResourceRepository resourceRepository;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Appointment> searchAppointments(@RequestParam String query) {
        return appointmentRepository.searchAppointments(query);
    }

    @GetMapping("/client/{clientId}")
    public List<Appointment> getAppointmentsByClient(@PathVariable Long clientId) {
        return appointmentRepository.findByClientId(clientId);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @PostMapping
    @SuppressWarnings("null")
    public Appointment createAppointment(@RequestBody AppointmentRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        AppUser vet = appUserRepository.findById(request.getVetId())
                .orElseThrow(() -> new RuntimeException("Vet not found"));

        Resource resource = null;
        if (request.getResourceId() != null) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));
        }

        if (appointmentRepository.existsByVetIdAndStartTimeBetween(
                request.getVetId(), request.getStartTime(), request.getEndTime())) {
            throw new RuntimeException("Vet is busy");
        }

        Appointment appointment = Appointment.builder()
                .client(client)
                .patient(patient)
                .vet(vet)
                .resource(resource)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .notes(request.getNotes())
                .reason(request.getReason())
                .type(request.getType())
                .status(AppointmentStatus.SCHEDULED)
                .build();

        // Save the appointment
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Perform fresh fetch to ensure all EAGER relationships are fully populated
        return appointmentRepository.findById(savedAppointment.getId()).orElseThrow();
    }

    @PutMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    // Update client if provided
                    if (request.getClientId() != null) {
                        Client client = clientRepository.findById(request.getClientId())
                                .orElseThrow(() -> new RuntimeException("Client not found"));
                        appointment.setClient(client);
                    }

                    // Update patient if provided
                    if (request.getPatientId() != null) {
                        Patient patient = patientRepository.findById(request.getPatientId())
                                .orElseThrow(() -> new RuntimeException("Patient not found"));
                        appointment.setPatient(patient);
                    }

                    // Update vet if provided
                    if (request.getVetId() != null) {
                        AppUser vet = appUserRepository.findById(request.getVetId())
                                .orElseThrow(() -> new RuntimeException("Vet not found"));
                        appointment.setVet(vet);
                    }

                    // Update resource if provided
                    if (request.getResourceId() != null) {
                        Resource resource = resourceRepository.findById(request.getResourceId())
                                .orElseThrow(() -> new RuntimeException("Resource not found"));
                        appointment.setResource(resource);
                    }

                    // Update other fields
                    if (request.getStartTime() != null) {
                        appointment.setStartTime(request.getStartTime());
                    }
                    if (request.getEndTime() != null) {
                        appointment.setEndTime(request.getEndTime());
                    }
                    if (request.getNotes() != null) {
                        appointment.setNotes(request.getNotes());
                    }
                    if (request.getReason() != null) {
                        appointment.setReason(request.getReason());
                    }
                    if (request.getType() != null) {
                        appointment.setType(request.getType());
                    }

                    Appointment savedAppointment = appointmentRepository.save(appointment);
                    return ResponseEntity.ok(appointmentRepository.findById(savedAppointment.getId()).orElseThrow());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable Long id, @RequestParam AppointmentStatus status) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(status);
                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        if (!appointmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        appointmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
