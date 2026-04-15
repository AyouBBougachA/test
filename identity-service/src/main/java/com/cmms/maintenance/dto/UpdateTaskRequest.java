package com.cmms.maintenance.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    private String title;
    private String description;
    private String notes;
    private Integer assignedToUserId;
    private BigDecimal estimatedDuration;
    private Integer orderIndex;
    private String blockedReason;
}
