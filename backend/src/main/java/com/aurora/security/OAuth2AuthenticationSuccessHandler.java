package com.aurora.security;

import com.aurora.model.entity.AuthProvider;
import com.aurora.model.entity.Role;
import com.aurora.model.entity.User;
import com.aurora.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Value("${app.client.url:http://localhost:4200}")
    private String clientUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String sub = oAuth2User.getAttribute("sub");

        log.info("Processing Google OAuth2 login for email: {}", email);

        User user = userRepository.findByEmail(email).map(existingUser -> {
            if (existingUser.getAuthProvider() == AuthProvider.LOCAL) {
                existingUser.setAuthProvider(AuthProvider.GOOGLE);
                existingUser.setProviderId(sub);
            }
            if (picture != null && existingUser.getAvatarUrl() == null) {
                existingUser.setAvatarUrl(picture);
            }
            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            String firstName = "";
            String lastName = "";
            if (name != null) {
                String[] parts = name.split(" ", 2);
                firstName = parts[0];
                if (parts.length > 1) {
                    lastName = parts[1];
                }
            }
            User newUser = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .avatarUrl(picture)
                    .authProvider(AuthProvider.GOOGLE)
                    .providerId(sub)
                    .role(Role.ROLE_USER)
                    .isActive(true)
                    .build();
            return userRepository.save(newUser);
        });

        String token = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());

        String targetUrl = UriComponentsBuilder.fromUriString(clientUrl + "/auth/oauth2-redirect")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
