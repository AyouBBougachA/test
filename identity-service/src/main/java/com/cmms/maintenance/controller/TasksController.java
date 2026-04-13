package com.cmms.maintenance.controller;

import com.cmms.maintenance.dto.TaskResponse;
import com.cmms.maintenance.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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

    @PatchMapping("/{taskId}/complete")
    @Operation(summary = "Mark a task as completed")
    public TaskResponse complete(@PathVariable Integer taskId, Principal principal) {
        return taskService.completeTask(taskId, principal.getName());
    }
}
