package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.GlobalSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GlobalSettingRepo extends JpaRepository<GlobalSetting, Long> {
    Optional<GlobalSetting> findBySettingKey(String settingKey);
}
