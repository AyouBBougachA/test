package com.cmms.maintenance.controller;

import com.cmms.maintenance.dto.CreateTaskRequest;
import com.cmms.maintenance.dto.TaskResponse;
import com.cmms.maintenance.dto.UpdateTaskRequest;
import com.cmms.maintenance.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Work order task steps management")
@SecurityRequirement(name = "bearerAuth")
public class TasksController {

    private final TaskService taskService;
    
    @GetMapping
    @Operation(summary = "List all tasks")
    public List<TaskResponse> getAll() {
        return taskService.getAll();
    }

    @GetMapping("/work-order/{woId}")
    @Operation(summary = "Get tasks for a work order")
    public List<TaskResponse> getByWorkOrder(@PathVariable Integer woId) {
        return taskService.getTasksForWorkOrder(woId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MAINTENANCE_MANAGER', 'TECHNICIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create task")
    public TaskResponse create(@Valid @RequestBody CreateTaskRequest request) {
        return taskService.create(request);
    }
    
    @PutMapping("/{taskId}")
    @Operation(summary = "Update task details")
    public TaskResponse update(@PathVariable Integer taskId, @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.update(taskId, request);
    }

    @PatchMapping("/{taskId}/complete")
    @Operation(summary = "Mark a task as DONE")
    public TaskResponse complete(@PathVariable Integer taskId, Principal principal) {
        return taskService.updateStatus(taskId, "DONE", principal.getName());
    }
    
    @PatchMapping("/{taskId}/status")
    @Operation(summary = "Update task status")
    public TaskResponse updateStatus(@PathVariable Integer taskId, @RequestParam String status, Principal principal) {
        return taskService.updateStatus(taskId, status, principal.getName());
    }

    @PatchMapping("/sub-tasks/{subTaskId}")
    @Operation(summary = "Toggle subtask completion")
    public void toggleSubTask(@PathVariable Integer subTaskId, @RequestParam boolean completed) {
        taskService.toggleSubTask(subTaskId, completed);
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAINTENANCE_MANAGER', 'TECHNICIAN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a task")
    public void delete(@PathVariable Integer taskId) {
        taskService.delete(taskId);
    }

    @PatchMapping("/{taskId}/approval")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAINTENANCE_MANAGER')")
    @Operation(summary = "Approve or reject an ad-hoc task")
    public TaskResponse updateApprovalStatus(@PathVariable Integer taskId, @RequestParam String status) {
        return taskService.updateApprovalStatus(taskId, status);
    }
}
