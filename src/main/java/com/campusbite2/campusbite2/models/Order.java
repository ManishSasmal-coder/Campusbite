package com.campusbite2.campusbite2.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
// import java.time.LocalDate;
import java.time.LocalDateTime;
// import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table( name= "orders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;
    @Column(nullable = false)
    private BigDecimal totalAmount;
    @Column(nullable = false)
    private String status;
//    @Column(nullable = false)
//    private LocalDate orderDate;
//    @Column(nullable = false)
//    private LocalTime orderTime;
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean deletedByUser = false;

    private LocalDateTime preparationStartedAt;
    private Integer totalEstimatedTime; // Max of all items in minutes

    // Many orders by one user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    // Many orders managed by one chef
    @ManyToOne
    @JoinColumn(name = "chef_id")
    private Chef chef;

    // One order contains many items
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems;
}
