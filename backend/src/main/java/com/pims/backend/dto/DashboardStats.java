package com.pims.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    private long totalPatients;
    private long totalAppointments;
    private long appointmentsToday;
    private BigDecimal totalRevenue;
}
