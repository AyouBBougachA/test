package com.cmms.bi.service;

import com.cmms.bi.dto.KpiResponse;
import com.cmms.claims.repository.ClaimRepository;
import com.cmms.inventory.repository.SparePartRepository;
import com.cmms.maintenance.entity.WorkOrder;
import com.cmms.maintenance.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KpiService {

    private final WorkOrderRepository workOrderRepository;
    private final ClaimRepository claimRepository;
    private final SparePartRepository sparePartRepository;

    @Transactional(readOnly = true)
    public KpiResponse getKpis() {
        List<WorkOrder> allWo = workOrderRepository.findAll();
        
        long totalWo = allWo.size();
        long activeWo = allWo.stream().filter(wo -> wo.getStatus() != WorkOrder.WorkOrderStatus.COMPLETED && wo.getStatus() != WorkOrder.WorkOrderStatus.CANCELLED).count();
        long pendingClaims = claimRepository.count(); // Simplified
        long lowStock = sparePartRepository.findAll().stream().filter(p -> p.getQuantityInStock() <= p.getMinStockLevel()).count();
        
        BigDecimal totalCost = allWo.stream()
                .map(wo -> wo.getActualCost() != null ? wo.getActualCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> statusMap = allWo.stream()
                .collect(Collectors.groupingBy(wo -> wo.getStatus().name(), Collectors.counting()));

        Map<String, Long> typeMap = allWo.stream()
                .collect(Collectors.groupingBy(wo -> wo.getWoType().name(), Collectors.counting()));

        return KpiResponse.builder()
                .totalWorkOrders(totalWo)
                .activeWorkOrders(activeWo)
                .pendingClaims(pendingClaims)
                .lowStockParts(lowStock)
                .totalMaintenanceCost(totalCost)
                .mtbf(720.0) // Placeholder
                .mttr(4.5)   // Placeholder
                .woByStatus(statusMap)
                .woByType(typeMap)
                .costByDepartment(new HashMap<>())
                .build();
    }
}
