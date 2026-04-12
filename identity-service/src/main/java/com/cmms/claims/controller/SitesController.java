package com.cmms.claims.controller;

import com.cmms.claims.dto.CreateSiteRequest;
import com.cmms.claims.dto.SiteResponse;
import com.cmms.claims.service.SiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Tag(name = "Sites", description = "Sites reference data for Claims")
@SecurityRequirement(name = "bearerAuth")
public class SitesController {

    private final SiteService siteService;

    @GetMapping
    @Operation(summary = "List sites")
    public List<SiteResponse> list() {
        return siteService.listSites();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new site", description = "Requires ADMIN role")
    public SiteResponse create(@Valid @RequestBody CreateSiteRequest request) {
        return siteService.createSite(request);
    }
}
