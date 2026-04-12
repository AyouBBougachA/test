package com.cmms.maintenance.service;

import com.cmms.maintenance.dto.TaskResponse;
import com.cmms.maintenance.entity.Task;
import com.cmms.maintenance.repository.TaskRepository;
import com.cmms.claims.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksForWorkOrder(Integer woId) {
        return taskRepository.findByWoIdOrderByOrderIndexAsc(woId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse completeTask(Integer taskId, String completedBy) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        task.setStatus(Task.TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        task.setCompletedBy(completedBy);
        
        return toResponse(taskRepository.save(task));
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .taskId(task.getTaskId())
                .woId(task.getWoId())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .completedAt(task.getCompletedAt())
                .completedBy(task.getCompletedBy())
                .orderIndex(task.getOrderIndex())
                .build();
    }
}
