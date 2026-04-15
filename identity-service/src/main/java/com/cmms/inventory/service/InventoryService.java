package com.cmms.inventory.service;

import com.cmms.inventory.dto.CreateSparePartRequest;
import com.cmms.inventory.dto.SparePartResponse;
import com.cmms.inventory.dto.PartUsageResponse;
import com.cmms.inventory.dto.UsePartRequest;
import com.cmms.inventory.entity.SparePart;
import com.cmms.inventory.entity.PartUsage;
import com.cmms.inventory.repository.SparePartRepository;
import com.cmms.inventory.repository.PartUsageRepository;
import com.cmms.claims.exception.ResourceNotFoundException;
import com.cmms.maintenance.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final SparePartRepository sparePartRepository;
    private final PartUsageRepository partUsageRepository;
    private final WorkOrderRepository workOrderRepository;
    private final com.cmms.bi.repository.InventoryTransactionRepository transactionRepository;
    private final com.cmms.inventory.repository.RestockRequestRepository restockRepository;
    private final com.cmms.notifications.service.NotificationService notificationService;
    private final com.cmms.identity.repository.UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SparePartResponse> list(String category, String q, boolean lowStockOnly) {
        Specification<SparePart> spec = Specification.where(null);
        
        if (category != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("category"), category));
        }
        
        if (q != null && !q.isBlank()) {
            String like = "%" + q.trim().toLowerCase() + "%";
            spec = spec.and((root, cq, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("sku")), like)
            ));
        }
        
        if (lowStockOnly) {
            spec = spec.and((root, cq, cb) -> cb.lessThanOrEqualTo(root.get("quantityInStock"), root.get("minStockLevel")));
        }

        return sparePartRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SparePartResponse create(CreateSparePartRequest request) {
        SparePart part = SparePart.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .quantityInStock(request.getQuantityInStock())
                .minStockLevel(request.getMinStockLevel())
                .unitCost(request.getUnitCost())
                .location(request.getLocation())
                .supplier(request.getSupplier())
                .isArchived(false)
                .build();
        
        return toResponse(sparePartRepository.save(part));
    }

    @Transactional
    public SparePartResponse updateStock(Integer id, Integer quantity) {
        SparePart part = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found"));
        
        int change = quantity - part.getQuantityInStock();
        part.setQuantityInStock(quantity);
        
        // Log manual adjustment
        transactionRepository.save(com.cmms.bi.entity.InventoryTransaction.builder()
                .partId(id)
                .quantityChange(change)
                .transactionType("ADJUSTMENT")
                .notes("Manual stock adjustment")
                .build());

        return toResponse(sparePartRepository.save(part));
    }

    @Transactional
    public com.cmms.inventory.entity.RestockRequest createRestockRequest(Integer partId, Integer quantity, Integer userId) {
        com.cmms.inventory.entity.RestockRequest request = com.cmms.inventory.entity.RestockRequest.builder()
                .partId(partId)
                .quantity(quantity)
                .requestedBy(userId)
                .status(com.cmms.inventory.entity.RestockRequest.RestockStatus.PENDING)
                .build();
        
        com.cmms.inventory.entity.RestockRequest saved = restockRepository.save(request);

        // Notify Managers
        notifyManagers("RECOMMENDATION", "New Restock Request for Part ID: " + partId, saved.getRequestId());
        
        return saved;
    }

    @Transactional
    public void approveRestock(Integer requestId, Integer reviewerId) {
        com.cmms.inventory.entity.RestockRequest request = restockRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        
        if (request.getStatus() != com.cmms.inventory.entity.RestockRequest.RestockStatus.PENDING) {
            throw new IllegalStateException("Request is already " + request.getStatus());
        }

        SparePart part = sparePartRepository.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part not found"));

        // Update Stock
        part.setQuantityInStock(part.getQuantityInStock() + request.getQuantity());
        sparePartRepository.save(part);

        // Update Request
        request.setStatus(com.cmms.inventory.entity.RestockRequest.RestockStatus.APPROVED);
        request.setReviewedBy(reviewerId);
        request.setReviewedAt(java.time.LocalDateTime.now());
        restockRepository.save(request);

        // Log Transaction
        transactionRepository.save(com.cmms.bi.entity.InventoryTransaction.builder()
                .partId(part.getPartId())
                .quantityChange(request.getQuantity())
                .transactionType("RECEPTION")
                .referenceId(requestId)
                .createdBy(reviewerId)
                .build());
    }

    @Transactional
    public PartUsageResponse usePart(UsePartRequest request) {
        SparePart part = sparePartRepository.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part not found"));
        
        if (part.getQuantityInStock() < request.getQuantity()) {
            throw new IllegalStateException("Insufficient stock for part: " + part.getName());
        }

        // Decrement Stock
        part.setQuantityInStock(part.getQuantityInStock() - request.getQuantity());
        sparePartRepository.save(part);

        // Record Usage
        PartUsage usage = PartUsage.builder()
                .woId(request.getWoId())
                .taskId(request.getTaskId())
                .partId(request.getPartId())
                .quantityUsed(request.getQuantity())
                .unitCostAtUsage(part.getUnitCost())
                .build();
        
        PartUsage savedUsage = partUsageRepository.save(usage);

        // Log Transaction
        transactionRepository.save(com.cmms.bi.entity.InventoryTransaction.builder()
                .partId(part.getPartId())
                .quantityChange(-request.getQuantity())
                .transactionType("CONSUMPTION")
                .referenceId(request.getWoId())
                .build());

        // Low Stock Check
        if (part.getQuantityInStock() <= part.getMinStockLevel()) {
            notifyManagers("WARNING", "Low Stock Alert: " + part.getName() + " is below minimum level.", part.getPartId());
        }

        return toUsageResponse(savedUsage, part.getName());
    }

    @Transactional(readOnly = true)
    public java.math.BigDecimal getInventoryValuation() {
        return sparePartRepository.findAll().stream()
                .filter(p -> p.getUnitCost() != null)
                .map(p -> p.getUnitCost().multiply(java.math.BigDecimal.valueOf(p.getQuantityInStock())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }

    private void notifyManagers(String type, String message, Integer referenceId) {
        notificationService.notifyFinance(type, message, referenceId);
    }

    @Transactional(readOnly = true)
    public List<PartUsageResponse> getUsagesForWorkOrder(Integer woId) {
        return partUsageRepository.findByWoId(woId).stream()
                .map(u -> {
                    SparePart p = sparePartRepository.findById(u.getPartId()).orElse(null);
                    return toUsageResponse(u, p != null ? p.getName() : "Unknown Part");
                })
                .collect(Collectors.toList());
    }

    private PartUsageResponse toUsageResponse(PartUsage u, String partName) {
        return PartUsageResponse.builder()
                .usageId(u.getUsageId())
                .woId(u.getWoId())
                .taskId(u.getTaskId())
                .partId(u.getPartId())
                .partName(partName)
                .quantityUsed(u.getQuantityUsed())
                .unitCostAtUsage(u.getUnitCostAtUsage())
                .usedAt(u.getUsedAt())
                .build();
    }

    private SparePartResponse toResponse(SparePart part) {
        return SparePartResponse.builder()
                .partId(part.getPartId())
                .name(part.getName())
                .sku(part.getSku())
                .category(part.getCategory())
                .quantityInStock(part.getQuantityInStock())
                .minStockLevel(part.getMinStockLevel())
                .unitCost(part.getUnitCost())
                .location(part.getLocation())
                .supplier(part.getSupplier())
                .createdAt(part.getCreatedAt())
                .updatedAt(part.getUpdatedAt())
                .build();
    }
}
