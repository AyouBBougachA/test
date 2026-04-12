package com.cmms.equipment.client;

import com.cmms.identity.repository.DepartmentRepository;
import com.cmms.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IdentityServiceClient {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public boolean checkDepartmentExists(Integer id) {
        return id != null && departmentRepository.existsById(id);
    }

    public boolean checkUserExists(Integer id) {
        return id != null && userRepository.existsById(id);
    }
}
