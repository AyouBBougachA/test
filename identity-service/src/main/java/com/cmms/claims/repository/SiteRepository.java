package com.cmms.claims.repository;

import com.cmms.claims.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Integer> {

    List<Site> findAllByOrderBySiteNameAsc();

    boolean existsBySiteNameIgnoreCase(String siteName);
}
