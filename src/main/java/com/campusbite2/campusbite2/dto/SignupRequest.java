package com.campusbite2.campusbite2.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String fullName;
    private String email_id;
    private String password;
}
