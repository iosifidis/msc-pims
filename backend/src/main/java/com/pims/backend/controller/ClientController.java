package com.pims.backend.controller;

import com.pims.backend.entity.Client;
import com.pims.backend.entity.Patient;
import com.pims.backend.enums.Sex;
import com.pims.backend.enums.Species;
import com.pims.backend.repository.ClientRepository;
import com.pims.backend.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientRepository clientRepository;
    private final PatientRepository patientRepository;

    public ClientController(ClientRepository clientRepository, PatientRepository patientRepository) {
        this.clientRepository = clientRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Client> createClient(@RequestBody ClientRequest request) {
        Client client = new Client();
        client.setFirstName(request.getFirstName());
        client.setLastName(request.getLastName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhoneNumber());
        client.setAddress(request.getAddress());

        Client savedClient = clientRepository.save(client);
        return ResponseEntity.ok(savedClient);
    }

    @PostMapping("/{clientId}/patients")
    public ResponseEntity<Patient> addPatient(@PathVariable Long clientId, @RequestBody PatientRequest request) {
        return clientRepository.findById(clientId).map(client -> {
            Patient patient = new Patient();
            patient.setName(request.getName());
            if (request.getSpecies() != null) {
                patient.setSpecies(Species.valueOf(request.getSpecies().toUpperCase()));
            }
            patient.setBreed(request.getBreed());
            if (request.getSex() != null) {
                patient.setSex(Sex.valueOf(request.getSex().toUpperCase()));
            }
            patient.setOwner(client);

            return ResponseEntity.ok(patientRepository.save(patient));
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class ClientRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String address;

        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getEmail() { return email; }
        public String getPhoneNumber() { return phoneNumber; }
        public String getAddress() { return address; }
    }

    public static class PatientRequest {
        private String name;
        private String species;
        private String breed;
        private Integer age;
        private String sex;

        public String getName() { return name; }
        public String getSpecies() { return species; }
        public String getBreed() { return breed; }
        public Integer getAge() { return age; }
        public String getSex() { return sex; }
    }
}
