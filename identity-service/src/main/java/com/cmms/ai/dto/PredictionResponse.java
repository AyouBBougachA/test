package com.cmms.ai.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {
    private Integer equipmentId;
    private String equipmentName;
    private double riskScore; // 0 to 100
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String recommendation;
    private List<String> factors;
}
