package com.cmms.claims.service;

import com.cmms.claims.dto.CreateSiteRequest;
import com.cmms.claims.dto.SiteResponse;
import com.cmms.claims.entity.Site;
import com.cmms.claims.repository.SiteRepository;
import com.cmms.identity.security.UserPrincipal;
import com.cmms.identity.service.AuditLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteService {

    private static final String ENTITY_NAME = "Site";

    private final SiteRepository siteRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<SiteResponse> listSites() {
        return siteRepository.findAllByOrderBySiteNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SiteResponse createSite(@Valid CreateSiteRequest request) {
        String name = request.getSiteName().trim();

        if (siteRepository.existsBySiteNameIgnoreCase(name)) {
            throw new IllegalStateException("Site already exists: " + name);
        }

        Site site = Site.builder()
                .siteName(name)
                .siteCode(request.getSiteCode() == null ? null : request.getSiteCode().trim())
                .build();

        Site saved = siteRepository.save(site);

        Actor actor = getCurrentActorRequired();
        auditLogService.log(
                actor.userId,
                actor.displayName,
                "CREATE_SITE",
                ENTITY_NAME,
                saved.getSiteId(),
                "Created site: " + saved.getSiteName()
        );

        return toResponse(saved);
    }

    private SiteResponse toResponse(Site site) {
        return SiteResponse.builder()
                .siteId(site.getSiteId())
                .siteName(site.getSiteName())
                .siteCode(site.getSiteCode())
                .build();
    }

    private static Actor getCurrentActorRequired() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Authentication required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            Integer userId = userPrincipal.getUser() == null ? null : userPrincipal.getUser().getUserId();
            String displayName = userPrincipal.getUser() == null ? null : userPrincipal.getUser().getFullName();
            if (displayName == null || displayName.isBlank()) {
                displayName = userPrincipal.getUsername();
            }
            return new Actor(userId, displayName);
        }

        return new Actor(null, authentication.getName());
    }

    private record Actor(Integer userId, String displayName) {
    }
}
