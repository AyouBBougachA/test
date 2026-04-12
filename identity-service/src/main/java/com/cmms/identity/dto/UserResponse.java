package com.cmms.identity.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {

    private Integer userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String roleName;
    private Integer roleId;
    private String departmentName;
    private Integer departmentId;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
