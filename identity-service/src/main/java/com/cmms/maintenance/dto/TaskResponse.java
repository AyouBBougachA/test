package com.cmms.maintenance.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Integer taskId;
    private Integer woId;
    private String description;
    private String status;
    private LocalDateTime completedAt;
    private String completedBy;
    private Integer orderIndex;
}
