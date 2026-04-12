package com.cmms.claims.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSiteRequest {

    @NotBlank(message = "siteName is required")
    @Size(max = 255, message = "siteName must not exceed 255 characters")
    private String siteName;

    @Size(max = 50, message = "siteCode must not exceed 50 characters")
    private String siteCode;
}
