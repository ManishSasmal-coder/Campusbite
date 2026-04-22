package com.campusbite2.campusbite2.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuItemId;

    @Column(nullable= false)
    private String name;
    @Column(nullable= false)
    private String description;
    @Column(nullable= false)
    private BigDecimal price;
    @Column(nullable= false)
    private String type; // Veg / Non-Veg
    @Column(nullable= false)
    private String imageUrl;

    @Column(nullable = false)
    private Integer preparationTime = 0; // In minutes

    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;
}
