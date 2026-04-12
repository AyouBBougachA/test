package com.cmms.claims.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ClaimResponse {
    private Integer claimId;
    private String claimCode;

    private String title;
    private String description;

    private Integer equipmentId;
    private String equipmentName;

    private String priority;
    private String priorityLabel;

    private String status;
    private String statusLabel;

    private Integer requesterId;
    private String requesterName;

    private Integer assignedToUserId;
    private String assignedToName;

    private Integer departmentId;
    private String departmentName;

    private Integer siteId;
    private String siteName;

    private String qualificationNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;

    private Long photoCount;
    private List<ClaimPhotoResponse> photos;
}
