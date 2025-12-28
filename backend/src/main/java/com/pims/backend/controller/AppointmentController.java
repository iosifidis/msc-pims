package com.pims.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final PatientRepository patientRepository;
    private final AppUserRepository appUserRepository;
    private final ResourceRepository resourceRepository;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                 ClientRepository clientRepository,
                                 PatientRepository patientRepository,
                                 AppUserRepository appUserRepository,
                                 ResourceRepository resourceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.clientRepository = clientRepository;
        this.patientRepository = patientRepository;
        this.appUserRepository = appUserRepository;
        this.resourceRepository = resourceRepository;
    }

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

    @GetMapping("/next")
    public ResponseEntity<Appointment> getNextAppointment(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        AppUser vet = appUserRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Vet user not found"));

        Appointment nextAppointment = appointmentRepository.findFirstByVetIdAndStartTimeAfterOrderByStartTimeAsc(
                vet.getId(), LocalDateTime.now());

        if (nextAppointment == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(nextAppointment);
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
    public ResponseEntity<Appointment> createAppointment(@RequestBody AppointmentRequest request) {
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

        Appointment appointment = new Appointment();
        appointment.setClient(client);
        appointment.setPatient(patient);
        appointment.setVet(vet);
        appointment.setResource(resource);
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setNotes(request.getNotes());
        appointment.setReason(request.getReason());
        appointment.setType(request.getType());
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return ResponseEntity.ok(savedAppointment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    if (request.getClientId() != null) {
                        appointment.setClient(clientRepository.findById(request.getClientId()).orElseThrow());
                    }
                    if (request.getPatientId() != null) {
                        appointment.setPatient(patientRepository.findById(request.getPatientId()).orElseThrow());
                    }
                    if (request.getVetId() != null) {
                        appointment.setVet(appUserRepository.findById(request.getVetId()).orElseThrow());
                    }
                    if (request.getResourceId() != null) {
                        appointment.setResource(resourceRepository.findById(request.getResourceId()).orElseThrow());
                    }
                    if (request.getStartTime() != null) appointment.setStartTime(request.getStartTime());
                    if (request.getEndTime() != null) appointment.setEndTime(request.getEndTime());
                    if (request.getNotes() != null) appointment.setNotes(request.getNotes());
                    if (request.getReason() != null) appointment.setReason(request.getReason());
                    if (request.getType() != null) appointment.setType(request.getType());

                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        if (!appointmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        appointmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}