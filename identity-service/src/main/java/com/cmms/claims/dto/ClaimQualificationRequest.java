package com.cmms.claims.dto;

import lombok.Data;

@Data
public class ClaimQualificationRequest {

    private String priority;

    private String qualificationNotes;

    private Integer assignedToUserId;
}
