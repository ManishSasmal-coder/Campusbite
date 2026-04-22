package com.campusbite2.campusbite2.controllers;

import com.campusbite2.campusbite2.models.GlobalSetting;
import com.campusbite2.campusbite2.repositories.GlobalSettingRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class GlobalSettingController {

    @Autowired
    GlobalSettingRepo settingRepo;

    @GetMapping
    public Map<String, String> getSettings() {
        List<GlobalSetting> settings = settingRepo.findAll();
        Map<String, String> map = new HashMap<>();
        for (GlobalSetting s : settings) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        // Defaults if none exist
        if (!map.containsKey("PAYMENT_UPI")) map.put("PAYMENT_UPI", "campusbite@upi");
        if (!map.containsKey("PAYMENT_QR_PATH")) map.put("PAYMENT_QR_PATH", "img/payment_qr.png");
        
        return map;
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> payload) {
        payload.forEach((key, value) -> {
            GlobalSetting setting = settingRepo.findBySettingKey(key)
                    .orElse(new GlobalSetting(key, value));
            setting.setSettingValue(value);
            settingRepo.save(setting);
        });
        return ResponseEntity.ok("Settings updated");
    }

    @PostMapping("/upload-qr")
    public ResponseEntity<?> uploadQr(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("No file uploaded");

        try {
            String uploadDir = "./uploads/";
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = "payment_qr_" + System.currentTimeMillis() + "_" + StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update database
            GlobalSetting setting = settingRepo.findBySettingKey("PAYMENT_QR_PATH")
                    .orElse(new GlobalSetting("PAYMENT_QR_PATH", ""));
            setting.setSettingValue("uploads/" + filename);
            settingRepo.save(setting);

            return ResponseEntity.ok(Map.of("path", "uploads/" + filename));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }
}
