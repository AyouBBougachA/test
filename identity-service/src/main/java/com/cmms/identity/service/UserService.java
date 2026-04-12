package com.cmms.identity.service;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import com.cmms.identity.dto.CreateUserRequest;
import com.cmms.identity.dto.UpdateUserRequest;
import com.cmms.identity.dto.UserResponse;
import com.cmms.identity.entity.Department;
import com.cmms.identity.entity.Role;
import com.cmms.identity.entity.User;
import com.cmms.identity.exception.DuplicateResourceException;
import com.cmms.identity.exception.ResourceNotFoundException;
import com.cmms.identity.mapper.UserMapper;
import com.cmms.identity.repository.DepartmentRepository;
import com.cmms.identity.repository.RoleRepository;
import com.cmms.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    private String getCurrentAuditorName() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "SYSTEM";
        }
        return authentication.getName();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer id) {
        User user = findUserEntityById(id);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already in use: " + request.getEmail());
        }

        Role role = findRoleEntityById(request.getRoleId());
        Department department = null;
        
        if (request.getDepartmentId() != null) {
            department = findDepartmentEntityById(request.getDepartmentId());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
            .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
            .department(isTechnician(role) ? department : null)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created new user. ID: {}, Email: {}", savedUser.getUserId(), savedUser.getEmail());

        // Log audit
        auditLogService.log(
                null, // performer ID not easily accessible here without more lookups
                getCurrentAuditorName(),
                "CREATE_USER",
                "User",
                savedUser.getUserId(),
                "Created user: " + savedUser.getEmail()
        );

        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Integer id, UpdateUserRequest request) {
        User user = findUserEntityById(id);

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email is already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        Role targetRole = user.getRole();
        if (request.getRoleId() != null) {
            targetRole = findRoleEntityById(request.getRoleId());
            user.setRole(targetRole);
        }

        if (isTechnician(targetRole)) {
            if (request.getDepartmentId() != null) {
                Department department = findDepartmentEntityById(request.getDepartmentId());
                user.setDepartment(department);
            }
        } else {
            user.setDepartment(null);
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated user info. ID: {}", updatedUser.getUserId());

        // Log audit
        auditLogService.log(
                null,
                getCurrentAuditorName(),
                "UPDATE_USER",
                "User",
                updatedUser.getUserId(),
                "Updated user details for: " + updatedUser.getEmail()
        );

        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponse updateUserStatus(Integer id, Boolean isActive) {
        if (isActive == null) {
             throw new IllegalArgumentException("isActive flag must be provided");
        }
        
        User user = findUserEntityById(id);
        user.setIsActive(isActive);
        User updatedUser = userRepository.save(user);
        
        log.info("Updated user status. ID: {}, isActive: {}", updatedUser.getUserId(), isActive);

        // Log audit (Security Action)
        auditLogService.log(
                null,
                getCurrentAuditorName(),
                isActive ? "ENABLE_USER" : "DISABLE_USER",
                "User",
                updatedUser.getUserId(),
                (isActive ? "Enabled" : "Disabled") + " account: " + updatedUser.getEmail()
        );

        return userMapper.toResponse(updatedUser);
    }

    // --- Helper Methods ---

    private User findUserEntityById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private Role findRoleEntityById(Integer id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
    }

    private Department findDepartmentEntityById(Integer id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
    }

    private boolean isTechnician(Role role) {
        return role != null && "TECHNICIAN".equalsIgnoreCase(role.getRoleName());
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Soft delete implementation
        user.setIsActive(false);
        userRepository.save(user);

        // Log audit (Security Action)
        auditLogService.log(
                null,
                getCurrentAuditorName(),
                "SOFT_DELETE_USER",
                "User",
                userId,
                "Soft deleted user account (deactivated): " + user.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(Integer roleId, Integer departmentId, String search) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (roleId != null) {
                predicates.add(cb.equal(root.get("role").get("roleId"), roleId));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("departmentId"), departmentId));
            }
            if (search != null && !search.isBlank()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate emailOrName = cb.or(
                        cb.like(cb.lower(root.get("email")), likePattern),
                        cb.like(cb.lower(root.get("fullName")), likePattern)
                );
                predicates.add(emailOrName);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }
}
