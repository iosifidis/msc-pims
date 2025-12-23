package com.pims.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.dto.ClientRequest;
import com.pims.backend.dto.PatientRequest;
import com.pims.backend.entity.Client;
import com.pims.backend.entity.Patient;
import com.pims.backend.enums.Sex;
import com.pims.backend.enums.Species;
import com.pims.backend.repository.ClientRepository;
import com.pims.backend.repository.PatientRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;
    private final PatientRepository patientRepository;

    /**
     * Get all clients with their pets
     * Pets are loaded via EAGER fetch type
     */
    @GetMapping
    @Transactional
    public List<Client> getAllClients() {
        // EAGER fetch ensures pets are loaded
        return clientRepository.findAll();
    }

    /**
     * Get a single client by ID with their pets
     * GET /api/clients/{id}
     */
    @GetMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create Client with optional initial Pet
     * Supports creating a client and their first pet in a single step
     */
    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Client> createClient(@RequestBody ClientRequest request) {
        // Step 1: Build and save the Client entity
        Client client = Client.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .afm(request.getAfm())
                .adt(request.getAdt())
                .phone(request.getPhone())
                .address(request.getAddress())
                .gdprConsent(request.getGdprConsent())
                .build();
        
        Client savedClient = clientRepository.save(client);
        
        // Step 2: Create initial Pet if petName is provided
        if (request.getPetName() != null && !request.getPetName().trim().isEmpty()) {
            // Parse species enum
            Species species = Species.OTHER; // default
            if (request.getPetSpecies() != null) {
                try {
                    species = Species.valueOf(request.getPetSpecies().toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Keep default if invalid
                }
            }
            
            // Parse sex enum
            Sex sex = null;
            if (request.getPetSex() != null) {
                try {
                    sex = Sex.valueOf(request.getPetSex().toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Keep null if invalid
                }
            }
            
            // Build and save Patient
            Patient patient = Patient.builder()
                    .name(request.getPetName())
                    .species(species)
                    .breed(request.getPetBreed())
                    .sex(sex)
                    .client(savedClient)
                    .build();
            
            patientRepository.save(patient);
        }
        
        // Return the saved client (will include the new pet due to EAGER fetch)
        return new ResponseEntity<>(clientRepository.findById(savedClient.getId()).orElseThrow(), HttpStatus.CREATED);
    }

    /**
     * Delete Client (cascade deletes all associated Pets and Appointments)
     */
    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Add a new Pet to an existing Client
     * POST /api/clients/{clientId}/pets
     */
    @PostMapping("/{clientId}/pets")
    @SuppressWarnings("null")
    @Transactional
    public ResponseEntity<Client> addPetToClient(
            @PathVariable Long clientId,
            @RequestBody PatientRequest request) {
        
        // Step 1: Fetch the Client
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));
        
        // Step 2: Parse species enum
        Species species = Species.OTHER; // default
        if (request.getSpecies() != null) {
            try {
                species = Species.valueOf(request.getSpecies().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Keep default if invalid
            }
        }
        
        // Step 3: Parse sex enum
        Sex sex = null;
        if (request.getSex() != null) {
            try {
                sex = Sex.valueOf(request.getSex().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Keep null if invalid
            }
        }
        
        // Step 4: Create new Patient
        Patient patient = Patient.builder()
                .name(request.getName())
                .species(species)
                .breed(request.getBreed())
                .sex(sex)
                .birthDate(request.getBirthDate())
                .microchipNumber(request.getMicrochipNumber())
                .microchipDate(request.getMicrochipDate())
                .isSterilized(request.getIsSterilized())
                .sterilizationDate(request.getSterilizationDate())
                .weight(request.getWeight())
                .client(client)
                .build();
        
        // Step 5: Save the Patient
        patientRepository.save(patient);
        
        // Step 6: Return updated Client with all pets (EAGER fetch)
        return ResponseEntity.ok(clientRepository.findById(clientId).orElseThrow());
    }
}
