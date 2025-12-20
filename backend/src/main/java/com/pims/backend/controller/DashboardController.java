package com.pims.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.dto.DashboardStats;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.InvoiceRepository;
import com.pims.backend.repository.PatientRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;

    @GetMapping("/stats")
    public DashboardStats getDashboardStats() {
        long totalPatients = patientRepository.count();
        long totalAppointments = appointmentRepository.count();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long appointmentsToday = appointmentRepository.countByStartTimeBetween(startOfDay, endOfDay);

        BigDecimal totalRevenue = invoiceRepository.sumTotalAmount();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return new DashboardStats(totalPatients, totalAppointments, appointmentsToday, totalRevenue);
    }
}
