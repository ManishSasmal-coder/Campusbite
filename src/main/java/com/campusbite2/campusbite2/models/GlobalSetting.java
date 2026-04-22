package com.campusbite2.campusbite2.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String settingKey;

    @Column(columnDefinition = "TEXT")
    private String settingValue;

    public GlobalSetting(String key, String value) {
        this.settingKey = key;
        this.settingValue = value;
    }
}
