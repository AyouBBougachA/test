package com.cmms.maintenance.dto;

import com.cmms.maintenance.entity.WorkOrder;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderResponse {
    private Integer woId;
    private String woCode; // e.g. WO-001
    private Integer claimId;
    private String claimCode;
    private Integer equipmentId;
    private String equipmentName;
    private String woType;
    private String priority;
    private String status;
    private String title;
    private String description;
    private Integer assignedToUserId;
    private String assignedToName;
    private BigDecimal estimatedTimeHours;
    private BigDecimal actualTimeHours;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    private String completionNotes;
}
