package com.pims.backend.config;

import com.pims.backend.entity.AppUser;
import com.pims.backend.entity.Appointment;
import com.pims.backend.entity.Client;
import com.pims.backend.entity.Patient;
import com.pims.backend.entity.Role;
import com.pims.backend.enums.AppointmentStatus;
import com.pims.backend.enums.Sex;
import com.pims.backend.enums.Species;
import com.pims.backend.repository.AppUserRepository;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.ClientRepository;
import com.pims.backend.repository.PatientRepository;
import com.pims.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final ClientRepository clientRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    // Explicit Constructor Injection
    public DataInitializer(AppUserRepository appUserRepository,
                           RoleRepository roleRepository,
                           ClientRepository clientRepository,
                           PatientRepository patientRepository,
                           AppointmentRepository appointmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.clientRepository = clientRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles
        if (roleRepository.count() == 0) {
            List<String> roles = List.of("ADMIN", "VET", "RECEPTIONIST", "OWNER");
            for (String roleName : roles) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        }

        // Create Data only if users table is empty
        if (appUserRepository.count() == 0) {
            Role vetRole = roleRepository.findByName("VET")
                    .orElseThrow(() -> new RuntimeException("Role VET not found"));

            // --- Create Vets (Using Setters) ---
            AppUser vet1 = new AppUser();
            vet1.setUsername("vet1");
            vet1.setPasswordHash(passwordEncoder.encode("password"));
            vet1.setFullName("Dr. John Smith");
            vet1.setEmail("vet1@pims.com");
            vet1.setRole(vetRole);
            vet1.setIsActive(true);
            appUserRepository.save(vet1);

            AppUser vet2 = new AppUser();
            vet2.setUsername("vet2");
            vet2.setPasswordHash(passwordEncoder.encode("password"));
            vet2.setFullName("Dr. Jane Doe");
            vet2.setEmail("vet2@pims.com");
            vet2.setRole(vetRole);
            vet2.setIsActive(true);
            appUserRepository.save(vet2);

            // --- Create Clients (Using Setters) ---
            Client client1 = new Client();
            client1.setFirstName("Alice");
            client1.setLastName("Johnson");
            client1.setEmail("alice@example.com");
            client1.setPhone("1112223333");
            clientRepository.save(client1);

            Client client2 = new Client();
            client2.setFirstName("Bob");
            client2.setLastName("Williams");
            client2.setEmail("bob@example.com");
            client2.setPhone("4445556666");
            clientRepository.save(client2);

            // --- Create Patients (Using Setters & Enums) ---
            Patient patient1 = new Patient();
            patient1.setName("Rex");
            patient1.setSpecies(Species.DOG);
            patient1.setBreed("German Shepherd");
            patient1.setSex(Sex.MALE);
            patient1.setOwner(client1);
            patientRepository.save(patient1);

            Patient patient2 = new Patient();
            patient2.setName("Luna");
            patient2.setSpecies(Species.CAT);
            patient2.setBreed("Siamese");
            patient2.setSex(Sex.FEMALE);
            patient2.setOwner(client2);
            patientRepository.save(patient2);

            // --- Create Appointments (Using Setters & Enums) ---
            Appointment appt1 = new Appointment();
            appt1.setClient(client1);
            appt1.setPatient(patient1);
            appt1.setVet(vet1);
            appt1.setStartTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0));
            appt1.setEndTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(30));
            appt1.setReason("Annual Vaccination");
            appt1.setStatus(AppointmentStatus.SCHEDULED);
            appointmentRepository.save(appt1);

            Appointment appt2 = new Appointment();
            appt2.setClient(client2);
            appt2.setPatient(patient2);
            appt2.setVet(vet2);
            appt2.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
            appt2.setEndTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(30));
            appt2.setReason("General Checkup");
            appt2.setStatus(AppointmentStatus.SCHEDULED);
            appointmentRepository.save(appt2);
        }
    }
}