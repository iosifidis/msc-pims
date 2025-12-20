package com.pims.backend.dto;

import lombok.Data;

@Data
public class MedicalRecordRequest {
    private Long appointmentId;
    private String subjective;
    private String objective;
    private String assessment;
    private String plan;
}
