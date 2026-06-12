package com.antonela.art.config;

import com.antonela.art.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas publicas
                .requestMatchers("/api/health").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/client/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/client/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/client/forgot-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/client/validate-reset-token").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/client/reset-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()
                // Rutas publicas - catalogos
                .requestMatchers(HttpMethod.GET, "/api/services").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/gallery").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/appointments/available-slots").permitAll()
                // Rutas publicas - webhooks (Stripe envia sin auth)
                .requestMatchers("/api/webhook/**").permitAll()
                // Rutas protegidas - solo admin
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Rutas protegidas - requieren autenticacion (cliente)
                .requestMatchers("/api/client/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/appointments").authenticated()
                .requestMatchers("/api/cart/**").authenticated()
                .requestMatchers("/api/payments/**").authenticated()
                .requestMatchers("/api/cancellations/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
