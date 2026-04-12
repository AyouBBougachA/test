package com.cmms.claims.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SiteResponse {
    private Integer siteId;
    private String siteName;
    private String siteCode;
}
