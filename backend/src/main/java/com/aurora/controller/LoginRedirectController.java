package com.aurora.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginRedirectController {

    @Value("${app.client.url:https://aurora-creation-atelier.vercel.app}")
    private String clientUrl;

    @GetMapping({"/login", "/login/"})
    public String redirectToClientLogin(@RequestParam(required = false) String error) {
        String baseUrl = clientUrl.endsWith("/") ? clientUrl.substring(0, clientUrl.length() - 1) : clientUrl;
        if (error != null) {
            return "redirect:" + baseUrl + "/auth?error=" + error;
        }
        return "redirect:" + baseUrl + "/auth";
    }
}
