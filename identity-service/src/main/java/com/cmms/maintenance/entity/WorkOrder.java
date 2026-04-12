package com.cmms.maintenance.entity;

import com.cmms.claims.entity.Claim;
import com.cmms.equipment.entity.Equipment;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wo_id")
    private Integer woId;

    @Column(name = "claim_id")
    private Integer claimId;

    @Column(name = "equipment_id", nullable = false)
    private Integer equipmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "wo_type", nullable = false)
    private WorkOrderType woType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "assigned_to_user_id")
    private Integer assignedToUserId;

    @Column(name = "estimated_time_hours")
    private BigDecimal estimatedTimeHours;

    @Column(name = "actual_time_hours")
    private BigDecimal actualTimeHours;

    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost;

    @Column(name = "actual_cost")
    private BigDecimal actualCost;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completion_notes")
    private String completionNotes;

    @Builder.Default
    @Column(name = "is_archived")
    private Boolean isArchived = false;

    public enum WorkOrderType {
        CORRECTIVE, PREVENTIVE, PREDICTIVE, REGULATORY
    }

    public enum WorkOrderPriority {
        CRITICAL, HIGH, MEDIUM, LOW
    }

    public enum WorkOrderStatus {
        OPEN, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
    }
}
