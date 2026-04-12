package com.cmms.bi.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiResponse {
    private long totalWorkOrders;
    private long activeWorkOrders;
    private long pendingClaims;
    private long lowStockParts;
    private BigDecimal totalMaintenanceCost;
    private double mtbf; // Mean Time Between Failures
    private double mttr; // Mean Time To Repair
    private Map<String, Long> woByStatus;
    private Map<String, Long> woByType;
    private Map<String, BigDecimal> costByDepartment;
}
