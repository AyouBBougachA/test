package com.cmms.identity.service;

import com.cmms.identity.entity.AuditLog;
import com.cmms.identity.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    private static final List<String> SECURITY_ACTIONS = Arrays.asList(
            "LOGIN_FAILED",
            "DELETE_USER",
            "DELETE_ROLE",
            "CHANGE_ROLE",
            "DISABLE_USER",
            "ENABLE_USER"
    );

    @Transactional
    public void log(Integer userId, String userName, String actionType, String entityName, Integer entityId, String details) {
        String fullDetails = (userName != null ? userName + " " : "") + details;
        
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .actionType(actionType)
                .entityName(entityName)
                .entityId(entityId)
                .details(fullDetails)
                .build();
        
        auditLogRepository.save(auditLog);
        log.debug("Logged audit action: {} by user: {}", actionType, userName);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs(int limit) {
        return auditLogRepository.findRecentLogs().stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getSecurityLogs(int limit) {
        return auditLogRepository.findSecurityLogs(SECURITY_ACTIONS).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getByEntity(String entityName, Integer entityId) {
        return auditLogRepository.findByEntity(entityName, entityId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByEntities(List<String> entityNames, int limit) {
        return auditLogRepository.findByEntityNames(entityNames).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
}
