package com.cmms.maintenance.repository;

import com.cmms.maintenance.entity.WorkOrderLabor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderLaborRepository extends JpaRepository<WorkOrderLabor, Integer> {
    List<WorkOrderLabor> findByWoId(Integer woId);
    List<WorkOrderLabor> findByUserId(Integer userId);
}
