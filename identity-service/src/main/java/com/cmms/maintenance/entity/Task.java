package com.cmms.maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Integer taskId;

    @Column(name = "wo_id", nullable = false)
    private Integer woId;

    /** Short title of the task step */
    @Column(length = 255)
    private String title;

    /** Detailed description / instructions */
    @Column(nullable = false)
    private String description;

    /** Technician notes added during execution */
    @Column(name = "notes")
    private String notes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.TODO;

    /** Technician assigned to this specific task (optional; defaults to WO assignee) */
    @Column(name = "assigned_to_user_id")
    private Integer assignedToUserId;

    /** Estimated hours to complete this task */
    @Column(name = "estimated_duration")
    private java.math.BigDecimal estimatedDuration;

    @Builder.Default
    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by")
    private String completedBy;

    @Column(name = "skipped_at")
    private LocalDateTime skippedAt;

    @Column(name = "skipped_by")
    private String skippedBy;

    @Column(name = "blocked_reason")
    private String blockedReason;

    @Column(name = "failure_reason")
    private String failureReason;

    @Builder.Default
    @Column(name = "is_ad_hoc", nullable = false)
    private Boolean isAdHoc = false;

    @Column(name = "created_by_user_id")
    private Integer createdByUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 20)
    private TaskApprovalStatus approvalStatus;

    @Column(name = "approved_by_user_id")
    private Integer approvedByUserId;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    public enum TaskStatus {
        TODO,
        IN_PROGRESS,
        DONE,
        PASS,
        FAIL,
        BLOCKED,
        SKIPPED
    }

    public enum TaskApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
