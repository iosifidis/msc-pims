package com.pims.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pims.backend.entity.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    long countByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    boolean existsByVetIdAndStartTimeBetween(Long vetId, LocalDateTime start, LocalDateTime end);
}
