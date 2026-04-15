package com.cmms.inventory.controller;

import com.cmms.inventory.entity.RestockRequest;
import com.cmms.inventory.service.InventoryService;
import com.cmms.inventory.repository.RestockRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/restock")
@Tag(name = "Inventory Restock", description = "Management of replenishment requests and reviews")
@RequiredArgsConstructor
public class RestockController {

    private final InventoryService inventoryService;
    private final RestockRequestRepository restockRepository;

    @PostMapping("/request")
    @Operation(summary = "Create a restock request")
    public RestockRequest createRequest(
            @RequestParam Integer partId,
            @RequestParam Integer quantity,
            @RequestParam Integer userId) {
        return inventoryService.createRestockRequest(partId, quantity, userId);
    }

    @GetMapping("/pending")
    @Operation(summary = "List all pending restock requests")
    public List<RestockRequest> listPending() {
        return restockRepository.findByStatus(RestockRequest.RestockStatus.PENDING);
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve and execute restock")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MAINTENANCE_MANAGER')")
    public void approve(@PathVariable Integer id, @RequestParam Integer reviewerId) {
        inventoryService.approveRestock(id, reviewerId);
    }
    
    @GetMapping("/valuation")
    @Operation(summary = "Get total inventory valuation")
    public java.math.BigDecimal getValuation() {
        return inventoryService.getInventoryValuation();
    }
}
