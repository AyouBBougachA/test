package com.cmms.identity.mapper;

import com.cmms.identity.dto.UserResponse;
import com.cmms.identity.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roleId(user.getRole() != null ? user.getRole().getRoleId() : null)
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getDepartmentId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
