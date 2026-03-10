package com.campusbite2.campusbite2.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private String role; // "STUDENT", "CHEF", "ADMIN"
}
