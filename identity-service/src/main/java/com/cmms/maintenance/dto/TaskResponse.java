package com.cmms.maintenance.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Integer       taskId;
    private Integer       woId;
    private String        title;
    private String        description;
    private String        notes;
    private String        status;
    private Integer       assignedToUserId;
    private String        assignedToName;
    private BigDecimal    estimatedDuration;
    private Integer       orderIndex;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String        completedBy;
    private LocalDateTime skippedAt;
    private String        skippedBy;
    private String        blockedReason;
    private String        failureReason;
    private List<SubTaskResponse> subTasks;
    private Boolean       isAdHoc;
    private Integer       createdByUserId;
    private String        approvalStatus;
    private Integer       approvedByUserId;
    private LocalDateTime approvedAt;
}
