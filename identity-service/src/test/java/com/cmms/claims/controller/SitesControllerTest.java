package com.cmms.claims.controller;

import com.cmms.claims.dto.SiteResponse;
import com.cmms.claims.exception.ClaimsExceptionHandler;
import com.cmms.claims.service.SiteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SitesController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ClaimsExceptionHandler.class)
@ContextConfiguration(classes = {SitesControllerTest.TestApplication.class, SitesController.class, ClaimsExceptionHandler.class})
class SitesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SiteService siteService;

    @Test
    void listSitesReturnsList() throws Exception {
        when(siteService.listSites()).thenReturn(List.of(
                SiteResponse.builder().siteId(1).siteName("Central Hospital").siteCode("CH").build()
        ));

        mockMvc.perform(get("/api/sites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].siteName").value("Central Hospital"));
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            JpaRepositoriesAutoConfiguration.class
    })
    static class TestApplication {
    }
}
