package com.pims.backend.controller;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pims.backend.dto.InvoiceRequest;
import com.pims.backend.entity.Appointment;
import com.pims.backend.entity.Invoice;
import com.pims.backend.repository.AppointmentRepository;
import com.pims.backend.repository.InvoiceRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;

    @PostMapping
    public Invoice createInvoice(@RequestBody InvoiceRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Invoice invoice = Invoice.builder()
                .appointment(appointment)
                .amount(request.getAmount())
                .status(request.getStatus() != null ? request.getStatus() : "UNPAID")
                .issuedAt(LocalDateTime.now())
                .build();

        return invoiceRepository.save(invoice);
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Invoice> getInvoiceByAppointment(@PathVariable Long appointmentId) {
        return invoiceRepository.findByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
