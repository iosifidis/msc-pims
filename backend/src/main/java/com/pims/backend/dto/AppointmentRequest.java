package com.pims.backend.dto;

import java.time.LocalDateTime;

import com.pims.backend.enums.AppointmentType;

import lombok.Data;

@Data
public class AppointmentRequest {
    private Long clientId;
    private Long patientId;
    private Long vetId;
    private Long resourceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
    private String reason;
    private AppointmentType type;
}
