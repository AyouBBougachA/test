package com.cmms.maintenance.service;

import com.cmms.claims.entity.Claim;
import com.cmms.claims.repository.ClaimRepository;
import com.cmms.equipment.entity.Equipment;
import com.cmms.equipment.repository.EquipmentRepository;
import com.cmms.maintenance.dto.CreateWorkOrderRequest;
import com.cmms.maintenance.dto.WorkOrderResponse;
import com.cmms.maintenance.entity.WorkOrder;
import com.cmms.maintenance.repository.WorkOrderRepository;
import com.cmms.identity.entity.User;
import com.cmms.identity.repository.UserRepository;
import com.cmms.claims.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final ClaimRepository claimRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> list(String status, String type, Integer equipmentId, Integer assignedToUserId) {
        Specification<WorkOrder> spec = Specification.where(null);
        
        if (status != null) spec = spec.and((root, cq, cb) -> cb.equal(root.get("status"), WorkOrder.WorkOrderStatus.valueOf(status.toUpperCase())));
        if (type != null) spec = spec.and((root, cq, cb) -> cb.equal(root.get("woType"), WorkOrder.WorkOrderType.valueOf(type.toUpperCase())));
        if (equipmentId != null) spec = spec.and((root, cq, cb) -> cb.equal(root.get("equipmentId"), equipmentId));
        if (assignedToUserId != null) spec = spec.and((root, cq, cb) -> cb.equal(root.get("assignedToUserId"), assignedToUserId));

        return workOrderRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkOrderResponse create(CreateWorkOrderRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        WorkOrder wo = WorkOrder.builder()
                .claimId(request.getClaimId())
                .equipmentId(equipment.getEquipmentId())
                .woType(WorkOrder.WorkOrderType.valueOf(request.getWoType().toUpperCase()))
                .priority(WorkOrder.WorkOrderPriority.valueOf(request.getPriority().toUpperCase()))
                .status(WorkOrder.WorkOrderStatus.OPEN)
                .title(request.getTitle())
                .description(request.getDescription())
                .assignedToUserId(request.getAssignedToUserId())
                .estimatedTimeHours(request.getEstimatedTimeHours())
                .estimatedCost(request.getEstimatedCost())
                .dueDate(request.getDueDate())
                .isArchived(false)
                .build();

        return toResponse(workOrderRepository.save(wo));
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse getById(Integer id) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work Order not found"));
        return toResponse(wo);
    }

    private WorkOrderResponse toResponse(WorkOrder wo) {
        Equipment equipment = equipmentRepository.findById(wo.getEquipmentId()).orElse(null);
        User assignee = wo.getAssignedToUserId() == null ? null : userRepository.findById(wo.getAssignedToUserId()).orElse(null);
        Claim claim = wo.getClaimId() == null ? null : claimRepository.findById(wo.getClaimId()).orElse(null);

        return WorkOrderResponse.builder()
                .woId(wo.getWoId())
                .woCode(String.format("WO-%03d", wo.getWoId()))
                .claimId(wo.getClaimId())
                .claimCode(claim == null ? null : String.format("CLM-%03d", claim.getClaimId()))
                .equipmentId(wo.getEquipmentId())
                .equipmentName(equipment == null ? null : equipment.getName())
                .woType(wo.getWoType().name())
                .priority(wo.getPriority().name())
                .status(wo.getStatus().name())
                .title(wo.getTitle())
                .description(wo.getDescription())
                .assignedToUserId(wo.getAssignedToUserId())
                .assignedToName(assignee == null ? null : assignee.getFullName())
                .estimatedTimeHours(wo.getEstimatedTimeHours())
                .actualTimeHours(wo.getActualTimeHours())
                .estimatedCost(wo.getEstimatedCost())
                .actualCost(wo.getActualCost())
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .dueDate(wo.getDueDate())
                .completedAt(wo.getCompletedAt())
                .completionNotes(wo.getCompletionNotes())
                .build();
    }
}
