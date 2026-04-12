package com.cmms.maintenance.controller;

import com.cmms.maintenance.dto.CreateWorkOrderRequest;
import com.cmms.maintenance.dto.WorkOrderResponse;
import com.cmms.maintenance.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
@Tag(name = "Work Orders", description = "Management of maintenance work orders")
@SecurityRequirement(name = "bearerAuth")
public class WorkOrdersController {

    private final WorkOrderService workOrderService;

    @GetMapping
    @Operation(summary = "List work orders")
    public List<WorkOrderResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer equipmentId,
            @RequestParam(required = false) Integer assignedToUserId
    ) {
        return workOrderService.list(status, type, equipmentId, assignedToUserId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new work order")
    public WorkOrderResponse create(@Valid @RequestBody CreateWorkOrderRequest request) {
        return workOrderService.create(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get work order by ID")
    public WorkOrderResponse get(@PathVariable Integer id) {
        return workOrderService.getById(id);
    }
}
