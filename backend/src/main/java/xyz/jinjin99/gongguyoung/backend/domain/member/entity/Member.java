package xyz.jinjin99.gongguyoung.backend.domain.member.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "member")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true, unique = true)
    private String userKey;

    @Column (nullable = false)
    private String password;

    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BnplLimit bnplLimit;

    // 입출금 계좌
    @Column(nullable = true)
    private String starterAccountNo;

    // BNPL 계좌
    @Column(nullable = true)
    private String flexAccountNo;
    
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<KeywordAlert> keywordAlerts = new ArrayList<>();
    
    public Member(String name, String email) {
        this.name = name;
        this.email = email;
    }
}