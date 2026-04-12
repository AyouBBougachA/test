package com.cmms.equipment.repository;

import com.cmms.equipment.entity.Meter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MeterRepository extends JpaRepository<Meter, Integer> {
    Optional<Meter> findByEquipmentId(Integer equipmentId);
}
