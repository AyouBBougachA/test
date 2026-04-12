package com.cmms.inventory.controller;

import com.cmms.inventory.dto.CreateSparePartRequest;
import com.cmms.inventory.dto.SparePartResponse;
import com.cmms.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Spare parts and stock management")
@SecurityRequirement(name = "bearerAuth")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "List spare parts")
    public List<SparePartResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "false") boolean lowStockOnly
    ) {
        return inventoryService.list(category, q, lowStockOnly);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a new spare part")
    public SparePartResponse create(@Valid @RequestBody CreateSparePartRequest request) {
        return inventoryService.create(request);
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update stock level for a part")
    public SparePartResponse updateStock(@PathVariable Integer id, @RequestParam Integer quantity) {
        return inventoryService.updateStock(id, quantity);
    }
}
