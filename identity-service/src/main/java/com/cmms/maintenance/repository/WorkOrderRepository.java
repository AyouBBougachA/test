package com.cmms.maintenance.repository;

import com.cmms.maintenance.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Integer>, JpaSpecificationExecutor<WorkOrder> {
    List<WorkOrder> findByClaimId(Integer claimId);
    List<WorkOrder> findByEquipmentId(Integer equipmentId);
    List<WorkOrder> findByAssignedToUserIdAndStatusIn(Integer userId, List<WorkOrder.WorkOrderStatus> statuses);
    List<WorkOrder> findAllByCreatedAtAfter(java.time.LocalDateTime time);
    boolean existsByClaimId(Integer claimId);
}
