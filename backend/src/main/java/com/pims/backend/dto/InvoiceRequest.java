package com.pims.backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class InvoiceRequest {
    private Long appointmentId;
    private BigDecimal amount;
    private String status;
}
