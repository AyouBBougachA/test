package com.cmms.maintenance.service;

import com.cmms.maintenance.dto.CreateTaskRequest;
import com.cmms.maintenance.dto.TaskResponse;
import com.cmms.maintenance.dto.UpdateTaskRequest;
import com.cmms.maintenance.repository.TaskRepository;
import com.cmms.maintenance.repository.SubTaskRepository;
import com.cmms.maintenance.repository.WorkOrderRepository;
import com.cmms.maintenance.entity.SubTask;
import com.cmms.maintenance.entity.WorkOrder;
import com.cmms.maintenance.dto.SubTaskResponse;
import com.cmms.maintenance.entity.Task;
import com.cmms.identity.entity.User;
import com.cmms.identity.repository.UserRepository;
import com.cmms.claims.exception.ResourceNotFoundException;
import com.cmms.identity.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_MAINTENANCE_MANAGER = "MAINTENANCE_MANAGER";
    private static final String ROLE_TECHNICIAN = "TECHNICIAN";
    private static final String ROLE_FINANCE_MANAGER = "FINANCE_MANAGER";

    private final TaskRepository taskRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;
    private final SubTaskRepository subTaskRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> getAll() {
        Actor actor = getCurrentActorRequired();
        
        if (actor.isAdminOrManager() || ROLE_FINANCE_MANAGER.equals(actor.role)) {
            return taskRepository.findAll()
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        
        if (ROLE_TECHNICIAN.equals(actor.role)) {
            List<Integer> myWoIds = workOrderRepository.findAll().stream()
                .filter(wo -> Objects.equals(wo.getAssignedToUserId(), actor.userId))
                .map(WorkOrder::getWoId)
                .collect(Collectors.toList());
                
            return taskRepository.findAll().stream()
                .filter(t -> myWoIds.contains(t.getWoId()))
                .map(this::toResponse)
                .collect(Collectors.toList());
        }
        
        throw new AccessDeniedException("Not allowed to view tasks");
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksForWorkOrder(Integer woId) {
        Actor actor = getCurrentActorRequired();
        WorkOrder wo = workOrderRepository.findById(woId)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found"));
        
        assertCanViewTaskWo(wo, actor);

        return taskRepository.findByWoIdOrderByOrderIndexAsc(woId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest request) {
        Actor actor = getCurrentActorRequired();

        WorkOrder wo = workOrderRepository.findById(request.getWoId())
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found"));

        boolean isAdHoc = false;
        Task.TaskApprovalStatus approvalStatus = null;

        if (ROLE_TECHNICIAN.equals(actor.role)) {
            if (!Objects.equals(actor.userId, wo.getAssignedToUserId())) {
                throw new AccessDeniedException("Technicians can only create ad-hoc tasks for work orders assigned to them");
            }
            isAdHoc = true;
            approvalStatus = Task.TaskApprovalStatus.PENDING;
        } else if (!actor.isAdminOrManager()) {
            throw new AccessDeniedException("Not allowed to create tasks");
        }

        Task task = Task.builder()
                .woId(wo.getWoId())
                .title(request.getTitle() != null ? request.getTitle() : request.getDescription()) // Fallback to description
                .description(request.getDescription())
                .assignedToUserId(request.getAssignedToUserId())
                .estimatedDuration(request.getEstimatedDuration())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .status(Task.TaskStatus.TODO)
                .isAdHoc(isAdHoc)
                .createdByUserId(actor.userId)
                .approvalStatus(approvalStatus)
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Integer taskId, UpdateTaskRequest request) {
        Actor actor = getCurrentActorRequired();
        Task task = getTaskEntity(taskId);
        
        assertCanEditTask(task, actor);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getNotes() != null) task.setNotes(request.getNotes());
        if (request.getAssignedToUserId() != null) task.setAssignedToUserId(request.getAssignedToUserId());
        if (request.getEstimatedDuration() != null) task.setEstimatedDuration(request.getEstimatedDuration());
        if (request.getOrderIndex() != null) task.setOrderIndex(request.getOrderIndex());
        if (request.getBlockedReason() != null) task.setBlockedReason(request.getBlockedReason());

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(Integer taskId, String statusStr, String actorName) {
        Actor actor = getCurrentActorRequired();
        Task task = getTaskEntity(taskId);
        
        assertCanEditTask(task, actor);

        if (Boolean.TRUE.equals(task.getIsAdHoc()) && task.getApprovalStatus() == Task.TaskApprovalStatus.PENDING) {
            throw new IllegalStateException("Cannot change status of a pending ad-hoc task. It must be approved first.");
        }

        Task.TaskStatus newStatus = Task.TaskStatus.valueOf(statusStr.toUpperCase());
        Task.TaskStatus oldStatus = task.getStatus();

        if (oldStatus == newStatus) return toResponse(task);

        task.setStatus(newStatus);

        if (newStatus == Task.TaskStatus.IN_PROGRESS && task.getStartedAt() == null) {
            task.setStartedAt(LocalDateTime.now());
        }

        if (newStatus == Task.TaskStatus.DONE || newStatus == Task.TaskStatus.PASS) {
            task.setCompletedAt(LocalDateTime.now());
            task.setCompletedBy(actorName);
        }

        if (newStatus == Task.TaskStatus.FAIL) {
            task.setCompletedAt(LocalDateTime.now());
            task.setCompletedBy(actorName);
            // task.setFailureReason("..."); // Notes not available in this simplified signature
            
            // Critical Failure Handling
            workOrderRepository.findById(task.getWoId()).ifPresent(wo -> {
                wo.setHasCriticalFailure(true);
                // If it's explicitly marked as a critical blocker in the future, we could force ON_HOLD
                // For now, setting the flag is Task 6 requirement. 
                // We'll add a boolean in the request for 'isCritical' if needed.
                workOrderRepository.save(wo);
            });
        }

        if (newStatus == Task.TaskStatus.SKIPPED) {
            task.setSkippedAt(LocalDateTime.now());
            task.setSkippedBy(actorName);
        }

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(Integer taskId) {
        Actor actor = getCurrentActorRequired();
        Task task = getTaskEntity(taskId);

        if (actor.isAdminOrManager()) {
            taskRepository.delete(task);
            return;
        }

        if (ROLE_TECHNICIAN.equals(actor.role)) {
            if (Boolean.TRUE.equals(task.getIsAdHoc()) && task.getApprovalStatus() == Task.TaskApprovalStatus.PENDING && Objects.equals(task.getCreatedByUserId(), actor.userId)) {
                taskRepository.delete(task);
                return;
            }
            throw new AccessDeniedException("Technicians can only delete their own pending ad-hoc tasks");
        }

        throw new AccessDeniedException("Not allowed to delete tasks");
    }

    @Transactional
    public TaskResponse updateApprovalStatus(Integer taskId, String approvalStatusStr) {
        Actor actor = getCurrentActorRequired();
        assertAdminOrManager(actor);

        Task task = getTaskEntity(taskId);
        if (!Boolean.TRUE.equals(task.getIsAdHoc())) {
            throw new IllegalStateException("Only ad-hoc tasks can be approved or rejected");
        }

        Task.TaskApprovalStatus newStatus = Task.TaskApprovalStatus.valueOf(approvalStatusStr.toUpperCase());
        task.setApprovalStatus(newStatus);
        task.setApprovedByUserId(actor.userId);
        task.setApprovedAt(LocalDateTime.now());

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void toggleSubTask(Integer subTaskId, boolean completed) {
        Actor actor = getCurrentActorRequired();
        SubTask st = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask not found"));
        
        Task task = getTaskEntity(st.getTaskId());
        assertCanEditTask(task, actor);

        st.setIsCompleted(completed);
        subTaskRepository.save(st);
    }

    private Task getTaskEntity(Integer taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private TaskResponse toResponse(Task task) {
        User user = task.getAssignedToUserId() == null ? null : userRepository.findById(task.getAssignedToUserId()).orElse(null);

        return TaskResponse.builder()
                .taskId(task.getTaskId())
                .woId(task.getWoId())
                .title(task.getTitle())
                .description(task.getDescription())
                .notes(task.getNotes())
                .status(task.getStatus().name())
                .assignedToUserId(task.getAssignedToUserId())
                .assignedToName(user == null ? null : user.getFullName())
                .estimatedDuration(task.getEstimatedDuration())
                .orderIndex(task.getOrderIndex())
                .startedAt(task.getStartedAt())
                .completedAt(task.getCompletedAt())
                .completedBy(task.getCompletedBy())
                .skippedAt(task.getSkippedAt())
                .skippedBy(task.getSkippedBy())
                .blockedReason(task.getBlockedReason())
                .isAdHoc(task.getIsAdHoc())
                .createdByUserId(task.getCreatedByUserId())
                .approvalStatus(task.getApprovalStatus() == null ? null : task.getApprovalStatus().name())
                .approvedByUserId(task.getApprovedByUserId())
                .approvedAt(task.getApprovedAt())
                .failureReason(task.getFailureReason())
                .subTasks(subTaskRepository.findByTaskIdOrderByOrderIndexAsc(task.getTaskId()).stream()
                    .map(st -> SubTaskResponse.builder()
                        .id(st.getId())
                        .taskId(st.getTaskId())
                        .description(st.getDescription())
                        .isCompleted(st.getIsCompleted())
                        .orderIndex(st.getOrderIndex())
                        .build())
                    .collect(Collectors.toList()))
                .build();
    }
    
    private void assertCanViewTaskWo(WorkOrder wo, Actor actor) {
        if (actor.isAdminOrManager() || ROLE_FINANCE_MANAGER.equals(actor.role)) return;
        if (ROLE_TECHNICIAN.equals(actor.role) && Objects.equals(actor.userId, wo.getAssignedToUserId())) return;
        throw new AccessDeniedException("Not allowed to view tasks for this work order");
    }

    private void assertCanEditTask(Task task, Actor actor) {
        if (actor.isAdminOrManager()) return;

        if (ROLE_FINANCE_MANAGER.equals(actor.role)) {
            throw new AccessDeniedException("FINANCE_MANAGER not allowed to edit tasks");
        }

        if (ROLE_TECHNICIAN.equals(actor.role)) {
            WorkOrder wo = workOrderRepository.findById(task.getWoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Linked work order not found for task"));
            
            if (Objects.equals(actor.userId, wo.getAssignedToUserId())) {
                return; // Technician owns the work order, allow task edit
            }
        }
        
        throw new AccessDeniedException("Not allowed to update this task");
    }

    private void assertAdminOrManager(Actor actor) {
        if (!actor.isAdminOrManager()) {
            throw new AccessDeniedException("Requires ADMIN or MAINTENANCE_MANAGER role");
        }
    }

    private Actor getCurrentActorRequired() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            User user = userPrincipal.getUser();
            return new Actor(
                    user == null ? null : user.getUserId(),
                    user == null || user.getFullName() == null ? authentication.getName() : user.getFullName(),
                    user == null || user.getRole() == null ? null : user.getRole().getRoleName().toUpperCase()
            );
        }
        return new Actor(null, authentication.getName(), null);
    }

    private record Actor(Integer userId, String displayName, String role) {
        boolean isAdminOrManager() {
            return ROLE_ADMIN.equals(role) || ROLE_MAINTENANCE_MANAGER.equals(role);
        }
    }
}
