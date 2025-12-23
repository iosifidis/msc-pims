package com.pims.backend.config;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.pims.backend.entity.AppUser;
import com.pims.backend.entity.Client;
import com.pims.backend.entity.Patient;
import com.pims.backend.entity.Resource;
import com.pims.backend.entity.Role;
import com.pims.backend.enums.ResourceType;
import com.pims.backend.enums.Species;
import com.pims.backend.repository.AppUserRepository;
import com.pims.backend.repository.ClientRepository;
import com.pims.backend.repository.ResourceRepository;
import com.pims.backend.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ClientRepository clientRepository;
    private final AppUserRepository appUserRepository;
    private final ResourceRepository resourceRepository;
    private final RoleRepository roleRepository;

    @Override
    @SuppressWarnings("null")
    public void run(String... args) throws Exception {
        // Initialize Client and Patient
        if (clientRepository.count() == 0) {
            Client client = Client.builder()
                    .firstName("Giannis")
                    .lastName("Papadopoulos")
                    .email("giannis.papadopoulos@example.com")
                    .phone("6912345678")
                    .address("Athens, Greece")
                    .afm("123456789")
                    .adt("AB123456")
                    .gdprConsent(true)
                    .balance(BigDecimal.ZERO)
                    .build();

            Patient patient = Patient.builder()
                    .name("Rex")
                    .species(Species.DOG)
                    .microchipNumber("123456789012345")
                    .isSterilized(true)
                    .client(client)
                    .build();

            client.setPatients(List.of(patient));

            clientRepository.save(client);
            System.out.println("Dummy data initialized: Client 'Giannis Papadopoulos' with Patient 'Rex'");
        }

        // Initialize Vet
        if (appUserRepository.count() == 0) {
            Role vetRole = roleRepository.findByName("VET")
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name("VET")
                            .permissions(Collections.emptySet())
                            .build()));

            AppUser vet = AppUser.builder()
                    .fullName("Dr. Gregory House")
                    .username("house") // Derived from email or just a username
                    .email("house@pims.com")
                    .passwordHash("password") // In a real app, this should be encoded
                    .role(vetRole)
                    //.isActive(true)
                    .build();

            appUserRepository.save(vet);
            System.out.println("Dummy data initialized: Vet 'Dr. Gregory House'");
        }

        // Initialize Resource
        if (resourceRepository.count() == 0) {
            Resource resource = Resource.builder()
                    .name("Exam Room 1")
                    .type(ResourceType.ROOM)
                    .build();

            resourceRepository.save(resource);
            System.out.println("Dummy data initialized: Resource 'Exam Room 1'");
        }
    }
}
