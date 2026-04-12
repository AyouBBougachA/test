package com.cmms.equipment.service;

import com.cmms.equipment.entity.Equipment;
import com.cmms.equipment.entity.EquipmentHistory;
import com.cmms.equipment.entity.EquipmentStatus;
import com.cmms.equipment.entity.Meter;
import com.cmms.equipment.entity.MeterThreshold;
import com.cmms.equipment.exception.ResourceNotFoundException;
import com.cmms.equipment.repository.EquipmentCategoryRepository;
import com.cmms.equipment.repository.EquipmentModelRepository;
import com.cmms.equipment.repository.EquipmentRepository;
import com.cmms.equipment.repository.EquipmentHistoryRepository;
import com.cmms.equipment.repository.MeterRepository;
import com.cmms.equipment.repository.MeterThresholdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

import com.cmms.equipment.client.IdentityServiceClient;
import com.cmms.identity.security.UserPrincipal;

import java.util.List;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentHistoryRepository historyRepository;
    private final MeterRepository meterRepository;
    private final MeterThresholdRepository meterThresholdRepository;
    private final EquipmentCategoryRepository categoryRepository;
    private final EquipmentModelRepository modelRepository;
    private final IdentityServiceClient identityServiceClient;

    private String getCurrentUserIdOrEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return "SYSTEM"; // Fallback for internal calls
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            Integer userId = userPrincipal.getUser().getUserId();
            return userId != null ? String.valueOf(userId) : userPrincipal.getUsername();
        }
        return authentication.getName();
    }

    @Transactional(readOnly = true)
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Equipment> searchEquipment(Integer departmentId, String status, String query) {
        Specification<Equipment> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("departmentId"), departmentId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), EquipmentStatus.valueOf(status)));
            }
            if (query != null && !query.isBlank()) {
                String likePattern = "%" + query.toLowerCase() + "%";
                Predicate nameOrSerial = cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("serialNumber")), likePattern)
                );
                predicates.add(nameOrSerial);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return equipmentRepository.findAll(spec);
    }

    @Transactional(readOnly = true)
    public Equipment getEquipmentById(Integer id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
    }

    @Transactional
    public Equipment createEquipment(Equipment equipment, List<BigDecimal> thresholds) {
        validateDepartment(equipment.getDepartmentId());
        validateCategoryAndModel(equipment.getCategoryId(), equipment.getModelId());

        
        Equipment saved = equipmentRepository.save(equipment);
        ensureMeterForEquipment(saved, thresholds);
        logHistory(saved.getEquipmentId(), "CREATED", getCurrentUserIdOrEmail());
        return saved;
    }

    @Transactional
    public Equipment updateEquipment(Integer id, Equipment update, List<BigDecimal> thresholds) {
        validateDepartment(update.getDepartmentId());
        validateCategoryAndModel(update.getCategoryId(), update.getModelId());

        
        Equipment existing = getEquipmentById(id);
        existing.setName(update.getName());
        existing.setSerialNumber(update.getSerialNumber());
        existing.setStatus(update.getStatus());
        existing.setLocation(update.getLocation());
        existing.setDepartmentId(update.getDepartmentId());
        existing.setCategoryId(update.getCategoryId());
        existing.setModelId(update.getModelId());
        existing.setManufacturer(update.getManufacturer());
        existing.setModelReference(update.getModelReference());
        existing.setClassification(update.getClassification());
        existing.setCriticality(update.getCriticality());
        existing.setMeterUnit(update.getMeterUnit());
        existing.setStartMeterValue(update.getStartMeterValue());
        existing.setPurchaseDate(update.getPurchaseDate());
        existing.setCommissioningDate(update.getCommissioningDate());
        existing.setSupplierName(update.getSupplierName());
        existing.setContractNumber(update.getContractNumber());
        existing.setWarrantyEndDate(update.getWarrantyEndDate());
        
        Equipment saved = equipmentRepository.save(existing);
        ensureMeterForEquipment(saved, thresholds);
        logHistory(saved.getEquipmentId(), "UPDATED", getCurrentUserIdOrEmail());
        return saved;
    }

    @Transactional
    public Equipment updateStatus(Integer id, String status) {
        Equipment existing = getEquipmentById(id);
        EquipmentStatus oldStatus = existing.getStatus();
        existing.setStatus(EquipmentStatus.valueOf(status));
        
        Equipment saved = equipmentRepository.save(existing);
        logHistory(saved.getEquipmentId(), "STATUS_CHANGE: " + oldStatus + " -> " + status, getCurrentUserIdOrEmail());
        return saved;
    }

    @Transactional
    public Equipment archiveEquipment(Integer id) {
        Equipment existing = getEquipmentById(id);
        existing.setStatus(EquipmentStatus.ARCHIVED);
        
        Equipment saved = equipmentRepository.save(existing);
        logHistory(saved.getEquipmentId(), "ARCHIVED", getCurrentUserIdOrEmail());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<EquipmentHistory> getHistory(Integer equipmentId) {
        return historyRepository.findByEquipmentIdOrderByCreatedAtDesc(equipmentId);
    }

    private void logHistory(Integer equipmentId, String action, String performedBy) {
        EquipmentHistory history = EquipmentHistory.builder()
                .equipmentId(equipmentId)
                .action(action)
                .performedBy(performedBy)
                .build();
        historyRepository.save(history);
    }
    
    private void validateDepartment(Integer departmentId) {
        if (departmentId != null) {
             try {
                 boolean exists = identityServiceClient.checkDepartmentExists(departmentId);
                 if (!exists) {
                     throw new IllegalArgumentException("Department ID does not exist in Identity Service: " + departmentId);
                 }
             } catch (Exception e) {
                 throw new RuntimeException("Failed to validate Department ID with Identity Service", e);
             }
        }
    }

    private void validateCategoryAndModel(Integer categoryId, Integer modelId) {
        if (categoryId != null && !categoryRepository.existsById(categoryId)) {
            throw new IllegalArgumentException("Category not found with ID: " + categoryId);
        }
        if (modelId != null && !modelRepository.existsById(modelId)) {
            throw new IllegalArgumentException("Model not found with ID: " + modelId);
        }
    }

    private void ensureMeterForEquipment(Equipment equipment, List<BigDecimal> thresholds) {
        if (equipment == null || equipment.getEquipmentId() == null) {
            return;
        }
        if (equipment.getStartMeterValue() != null && equipment.getStartMeterValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Start meter value must be non-negative");
        }
        Meter meter = meterRepository.findByEquipmentId(equipment.getEquipmentId())
                .orElseGet(() -> Meter.builder()
                        .equipmentId(equipment.getEquipmentId())
                        .name(equipment.getName() + " Usage")
                        .unit(equipment.getMeterUnit())
                        .meterType("ODOMETER")
                        .value(equipment.getStartMeterValue() != null ? equipment.getStartMeterValue() : BigDecimal.ZERO)
                        .lastReadingAt(java.time.LocalDateTime.now())
                        .build());

        meter.setName(equipment.getName() + " Usage");
        meter.setUnit(equipment.getMeterUnit());
        if (meter.getValue() == null && equipment.getStartMeterValue() != null) {
            meter.setValue(equipment.getStartMeterValue());
        }
        Meter savedMeter = meterRepository.save(meter);
        updateThresholdsForMeter(savedMeter.getMeterId(), thresholds);
    }

    private void updateThresholdsForMeter(Integer meterId, List<BigDecimal> thresholds) {
        if (meterId == null || thresholds == null) {
            return;
        }
        meterThresholdRepository.deleteByMeterId(meterId);
        for (BigDecimal thresholdValue : thresholds) {
            if (thresholdValue == null || thresholdValue.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Threshold values must be non-negative");
            }
            MeterThreshold threshold = MeterThreshold.builder()
                    .meterId(meterId)
                    .thresholdValue(thresholdValue)
                    .build();
            meterThresholdRepository.save(threshold);
        }
    }
}
