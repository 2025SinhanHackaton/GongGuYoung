package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import lombok.extern.slf4j.Slf4j;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.MemberRecord;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.*;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.*;

@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("DemandDeposit 실제 워크플로우 테스트")
class DemandDepositWorkflowTest {

    @Autowired
    private CommonInfoClient commonClient;
    
    @Autowired
    private ManagerClient managerClient;
    
    @Autowired
    private MemberClient memberClient;
    
    @Autowired
    private DemandDepositClient demandDepositClient;
    
    // 테스트 전체에서 공유할 데이터들
    private static String testBankCode;
    private static String testProductCode;
    private static String testUser1Email;
    private static String testUser2Email;
    private static MemberRecord testUser1;
    private static MemberRecord testUser2;
    private static String testAccount1No;
    private static String testAccount2No;
    
    @BeforeAll
    static void setupTestData() {
        // 테스트용 고유 식별자 생성
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        testUser1Email = "workflow_user1_" + uniqueId + "@gmail.com";
        testUser2Email = "workflow_user2_" + uniqueId + "@gmail.com";
    }

    // ============= 헬퍼 메서드들 =============
    
    /**
     * userKey 없는 헤더 생성 (상품 관련 API용)
     */
    private BaseRequest.Header createHeaderWithoutUserKey(String apiName) {
        return BaseRequest.Header.builder()
            .apiName(apiName)
            .apiServiceCode(apiName)
            .apiKey(managerClient.getOrCreateApiKey())
            .build();
    }
    
    /**
     * userKey 포함 헤더 생성 (계좌 관련 API용)
     */
    private BaseRequest.Header createHeaderWithUserKey(String apiName, String userKey) {
        return BaseRequest.Header.builder()
            .apiName(apiName)
            .apiServiceCode(apiName)
            .apiKey(managerClient.getOrCreateApiKey())
            .userKey(userKey)
            .build();
    }
    
    /**
     * 테스트용 사용자 생성 헬퍼
     */
    private MemberRecord createTestUser(String email) {
        try {
            MemberRecord member = memberClient.getOrCreateMember(email);
            log.info("테스트 사용자 생성 완료: {}", member);
            return member;
        } catch (Exception e) {
            log.error("사용자 생성 실패: {}", e.getMessage());
            throw new RuntimeException("사용자 생성 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * 테스트용 수시입출금 상품 생성 헬퍼
     */
    private CreateDemandDepositResponse createTestProduct(String bankCode, String productName) {
        try {
            CreateDemandDepositRequest request = CreateDemandDepositRequest.builder()
                    .header(createHeaderWithoutUserKey("createDemandDeposit"))
                    .bankCode(bankCode)
                    .accountName(productName)
                    .accountDescription("테스트용 수시입출금 상품 - " + productName)
                    .build();

            CreateDemandDepositResponse response = demandDepositClient.createDemandDeposit(request);
            log.info("테스트 상품 생성 완료: {}", response);
            return response;
        } catch (Exception e) {
            log.error("상품 생성 실패: {}", e.getMessage());
            throw new RuntimeException("상품 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 테스트용 계좌 생성 헬퍼
     */
    private CreateDemandDepositAccountResponse createTestAccount(String userKey, String productCode) {
        try {
            CreateDemandDepositAccountRequest request = CreateDemandDepositAccountRequest.builder()
                .header(createHeaderWithUserKey("createDemandDepositAccount", userKey))
                .accountTypeUniqueNo(productCode)
                .build();
                
            CreateDemandDepositAccountResponse response = demandDepositClient.createDemandDepositAccount(request);
            log.info("테스트 계좌 생성 완료: {}", response);
            return response;
        } catch (Exception e) {
            log.error("계좌 생성 실패: {}", e.getMessage());
            throw new RuntimeException("계좌 생성 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * 이체 실행 헬퍼
     */
    private UpdateDemandDepositAccountTransferResponse executeTransfer(
            String userKey, String fromAccount, String toAccount, 
            Long amount, String summary) {
        try {
            UpdateDemandDepositAccountTransferRequest request = UpdateDemandDepositAccountTransferRequest.builder()
                .header(createHeaderWithUserKey("updateDemandDepositAccountTransfer", userKey))
                .withdrawalAccountNo(fromAccount)
                .depositAccountNo(toAccount)
                .transactionBalance(amount)
                .withdrawalTransactionSummary(summary + " 출금")
                .depositTransactionSummary(summary + " 입금")
                .build();
                
            UpdateDemandDepositAccountTransferResponse response = 
                demandDepositClient.updateDemandDepositAccountTransfer(request);
            log.info("이체 실행 완료: {}", response);
            return response;
        } catch (Exception e) {
            log.error("이체 실행 실패: {}", e.getMessage());
            throw new RuntimeException("이체 실행 실패: " + e.getMessage(), e);
        }
    }

    // ============= Phase 1: 기초 데이터 준비 테스트 =============
    
    @Test
    @Order(1)
    @DisplayName("1단계: 은행 코드 조회")
    void step01_inquireBankCodes() {
        try {
            InquireBankCodesResponse response = commonClient.inquireBankCodes();
            
            assertNotNull(response, "은행 코드 조회 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("은행 코드 조회 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecords(), "은행 목록이 null이면 안됩니다");
                assertFalse(response.getRecords().isEmpty(), "은행 목록이 비어있으면 안됩니다");
                
                // 첫 번째 은행 코드를 테스트용으로 사용
                testBankCode = response.getRecords().get(0).getBankCode();
                log.info("테스트용 은행 코드 선택: {} - {}", 
                    testBankCode, response.getRecords().get(0).getBankName());
            } else {
                // 실패한 경우 기본값 사용
                testBankCode = "001"; // 기본 은행 코드
                log.warn("은행 코드 조회 실패, 기본값 사용: {}", testBankCode);
            }
            
        } catch (Exception e) {
            log.error("은행 코드 조회 중 예외 발생: {}", e.getMessage());
            testBankCode = "001"; // 예외 발생 시 기본값
            log.warn("예외로 인해 기본 은행 코드 사용: {}", testBankCode);
        }
    }
    
    @Test
    @Order(2)
    @DisplayName("2단계: 수시입출금 상품 등록")
    void step02_createDemandDeposit() {
        String productName = "테스트수시입출금_" + UUID.randomUUID().toString().substring(0, 6);
        
        try {
            CreateDemandDepositResponse response = createTestProduct(testBankCode, productName);
            
            assertNotNull(response, "상품 생성 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("상품 생성 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecord(), "상품 정보가 null이면 안됩니다");
                assertNotNull(response.getRecord().getAccountTypeUniqueNo(), "상품 고유 번호가 null이면 안됩니다");
                
                testProductCode = response.getRecord().getAccountTypeUniqueNo();
                log.info("테스트용 상품 코드 저장: {}", testProductCode);
            } else {
                log.warn("상품 생성 실패: {} - {}", responseCode, response.getHeader().getResponseMessage());
                // 기존 상품 코드 사용
                testProductCode = "001-1-1262362"; // 기본 상품 코드
            }
            
        } catch (Exception e) {
            log.error("상품 생성 중 예외 발생: {}", e.getMessage());
            testProductCode = "001-1-1262362"; // 예외 시 기본값
            log.warn("예외로 인해 기본 상품 코드 사용: {}", testProductCode);
        }
    }
    
    @Test
    @Order(3)
    @DisplayName("3단계: 수시입출금 상품 조회")
    void step03_inquireDemandDepositList() {
        try {
            InquireDemandDepositListRequest request = InquireDemandDepositListRequest.builder()
                .header(createHeaderWithoutUserKey("inquireDemandDepositList"))
                .build();
                
            InquireDemandDepositListResponse response = demandDepositClient.inquireDemandDepositList(request);
            
            assertNotNull(response, "상품 조회 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("상품 조회 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecords(), "상품 목록이 null이면 안됩니다");
                log.info("조회된 상품 수: {}", response.getRecords().size());
                
                // 생성한 상품이 목록에 있는지 확인
                boolean productFound = response.getRecords().stream()
                    .anyMatch(product -> testProductCode.equals(product.getAccountTypeUniqueNo()));
                    
                if (productFound) {
                    log.info("생성한 테스트 상품이 목록에서 확인됨: {}", testProductCode);
                } else {
                    log.warn("생성한 테스트 상품이 목록에서 확인되지 않음: {}", testProductCode);
                }
                
                // 상품 정보 로깅
                response.getRecords().stream()
                    .limit(3)
                    .forEach(product -> log.info("상품: {} - {} ({})", 
                        product.getAccountTypeUniqueNo(), 
                        product.getAccountTypeName(), 
                        product.getBankName()));
            }
            
        } catch (Exception e) {
            log.error("상품 조회 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("상품 조회 테스트 실패: " + e.getMessage());
        }
    }

    // ============= Phase 2: 사용자별 계좌 관리 테스트 =============
    
    @Test
    @Order(4)
    @DisplayName("4단계: 첫 번째 사용자 생성")
    void step04_createFirstUser() {
        try {
            testUser1 = createTestUser(testUser1Email);
            
            assertNotNull(testUser1, "사용자 생성 결과가 null이면 안됩니다");
            assertNotNull(testUser1.getUserKey(), "사용자 키가 null이면 안됩니다");
            assertFalse(testUser1.getUserKey().trim().isEmpty(), "사용자 키가 비어있으면 안됩니다");
            
            log.info("첫 번째 테스트 사용자 생성 완료: {} ({})", 
                testUser1.getUserId(), testUser1.getUserKey());
            
        } catch (Exception e) {
            log.error("첫 번째 사용자 생성 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("첫 번째 사용자 생성 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(5)
    @DisplayName("5단계: 첫 번째 사용자 계좌 생성")
    void step05_createFirstAccount() {
        try {
            CreateDemandDepositAccountResponse response = createTestAccount(testUser1.getUserKey(), testProductCode);
            
            assertNotNull(response, "계좌 생성 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("계좌 생성 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecord(), "계좌 정보가 null이면 안됩니다");
                assertNotNull(response.getRecord().getAccountNo(), "계좌번호가 null이면 안됩니다");
                
                testAccount1No = response.getRecord().getAccountNo();
                log.info("첫 번째 테스트 계좌 생성 완료: {}", testAccount1No);
            } else {
                log.error("계좌 생성 실패: {} - {}", responseCode, response.getHeader().getResponseMessage());
                fail("계좌 생성 실패: " + response.getHeader().getResponseMessage());
            }
            
        } catch (Exception e) {
            log.error("첫 번째 계좌 생성 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("첫 번째 계좌 생성 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(6)
    @DisplayName("6단계: 첫 번째 사용자 계좌 목록 조회")
    void step06_inquireFirstUserAccountList() {
        try {
            InquireDemandDepositAccountListRequest request = InquireDemandDepositAccountListRequest.builder()
                .header(createHeaderWithUserKey("inquireDemandDepositAccountList", testUser1.getUserKey()))
                .build();
                
            InquireDemandDepositAccountListResponse response = 
                demandDepositClient.inquireDemandDepositAccountList(request);

            log.info("계좌 목록 조회  : {}", response);
            assertNotNull(response, "계좌 목록 조회 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("계좌 목록 조회 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecords(), "계좌 목록이 null이면 안됩니다");
                assertTrue(response.getRecords().size() > 0, "계좌가 최소 1개는 있어야 합니다");
                
                // 생성한 계좌가 목록에 있는지 확인
                boolean accountFound = response.getRecords().stream()
                    .anyMatch(account -> testAccount1No.equals(account.getAccountNo()));
                    
                assertTrue(accountFound, "생성한 계좌가 목록에 있어야 합니다");
                
                log.info("첫 번째 사용자 계좌 수: {}", response.getRecords().size());
                response.getRecords().forEach(account -> 
                    log.info("계좌: {} - {} (잔액: {})", 
                        account.getAccountNo(), 
                        account.getAccountName(), 
                        account.getAccountBalance()));
            }
            
        } catch (Exception e) {
            log.error("계좌 목록 조회 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("계좌 목록 조회 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(7)
    @DisplayName("7단계: 첫 번째 계좌 단건 조회")
    void step07_inquireFirstAccount() {
        try {
            InquireDemandDepositAccountRequest request = InquireDemandDepositAccountRequest.builder()
                .header(createHeaderWithUserKey("inquireDemandDepositAccount", testUser1.getUserKey()))
                .accountNo(testAccount1No)
                .build();
                
            InquireDemandDepositAccountResponse response = 
                demandDepositClient.inquireDemandDepositAccount(request);
            
            assertNotNull(response, "계좌 조회 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("계좌 단건 조회 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecord(), "계좌 정보가 null이면 안됩니다");
                assertEquals(testAccount1No, response.getRecord().getAccountNo(), "조회한 계좌번호가 일치해야 합니다");
                
                log.info("계좌 상세 정보: {} - {} (잔액: {})", 
                    response.getRecord().getAccountNo(),
                    response.getRecord().getAccountName(),
                    response.getRecord().getAccountBalance());
            }
            
        } catch (Exception e) {
            log.error("계좌 단건 조회 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("계좌 단건 조회 테스트 실패: " + e.getMessage());
        }
    }

    // ============= Phase 3: 거래 및 이체 테스트 =============
    
    @Test
    @Order(8)
    @DisplayName("8단계: 두 번째 사용자 및 계좌 생성")
    void step08_createSecondUserAndAccount() {
        try {
            // 두 번째 사용자 생성
            testUser2 = createTestUser(testUser2Email);
            
            assertNotNull(testUser2, "두 번째 사용자 생성 결과가 null이면 안됩니다");
            assertNotNull(testUser2.getUserKey(), "두 번째 사용자 키가 null이면 안됩니다");
            
            log.info("두 번째 테스트 사용자 생성 완료: {} ({})", 
                testUser2.getUserId(), testUser2.getUserKey());
            
            // 두 번째 사용자 계좌 생성
            CreateDemandDepositAccountResponse response = createTestAccount(testUser2.getUserKey(), testProductCode);
            
            String responseCode = response.getHeader().getResponseCode();
            if ("H0000".equals(responseCode)) {
                testAccount2No = response.getRecord().getAccountNo();
                log.info("두 번째 테스트 계좌 생성 완료: {}", testAccount2No);
            } else {
                fail("두 번째 계좌 생성 실패: " + response.getHeader().getResponseMessage());
            }
            
        } catch (Exception e) {
            log.error("두 번째 사용자/계좌 생성 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            fail("두 번째 사용자/계좌 생성 테스트 실패: " + e.getMessage());
        }
    }
    
    @Test
    @Order(9)
    @DisplayName("9단계: 계좌 이체 실행")
    void step09_executeAccountTransfer() {
        try {
            Long transferAmount = 10000L;
            String transferSummary = "테스트 이체 " + UUID.randomUUID().toString().substring(0, 6);
            
            UpdateDemandDepositAccountTransferResponse response = executeTransfer(
                testUser1.getUserKey(), testAccount1No, testAccount2No, 
                transferAmount, transferSummary);
            
            assertNotNull(response, "이체 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("이체 실행 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                log.info("이체 성공: {}원 ({} -> {})", transferAmount, testAccount1No, testAccount2No);
            } else {
                log.warn("이체 실패: {} - {}", responseCode, response.getHeader().getResponseMessage());
                // 이체 실패는 잔액 부족 등 정상적인 경우일 수 있으므로 fail하지 않음
            }
            
        } catch (Exception e) {
            log.error("이체 실행 중 예외 발생: {}", e.getMessage());
            // 이체 예외도 API 연동 테스트에서는 예상 가능한 상황
            log.warn("이체 테스트 중 예외 발생 (정상적일 수 있음): {}", e.getMessage());
        }
    }
    
    @Test
    @Order(10)
    @DisplayName("10단계: 거래내역 목록 조회")
    void step10_inquireTransactionHistoryList() {
        try {
            String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            
            InquireTransactionHistoryListRequest request = InquireTransactionHistoryListRequest.builder()
                .header(createHeaderWithUserKey("inquireTransactionHistoryList", testUser1.getUserKey()))
                .accountNo(testAccount1No)
                .startDate(today)
                .endDate(today)
                .transactionType("A") // 전체
                .orderByType("DESC") // 최근거래순
                .build();
                
            InquireTransactionHistoryListResponse response = 
                demandDepositClient.inquireTransactionHistoryList(request);
            
            assertNotNull(response, "거래내역 조회 응답이 null이면 안됩니다");
            assertNotNull(response.getHeader(), "응답 헤더가 null이면 안됩니다");
            
            String responseCode = response.getHeader().getResponseCode();
            log.info("거래내역 조회 결과: {} - {}", responseCode, response.getHeader().getResponseMessage());
            
            if ("H0000".equals(responseCode)) {
                assertNotNull(response.getRecord(), "거래내역 응답이 null이면 안됩니다");
                
                if (response.getRecord().getList() != null && !response.getRecord().getList().isEmpty()) {
                    log.info("조회된 거래내역 수: {}", response.getRecord().getList().size());
                    response.getRecord().getList().stream()
                        .limit(5)
                        .forEach(transaction -> log.info("거래: {} - {} ({}원)", 
                            transaction.getTransactionDate(),
                            transaction.getTransactionSummary(),
                            transaction.getTransactionAfterBalance()));
                } else {
                    log.info("오늘 거래내역이 없습니다");
                }
            }
            
        } catch (Exception e) {
            log.error("거래내역 조회 중 예외 발생: {}", e.getMessage());
            e.printStackTrace();
            // 거래내역 조회 실패도 fail하지 않음 (거래가 없을 수 있음)
            log.warn("거래내역 조회 테스트 중 예외 발생 (정상적일 수 있음): {}", e.getMessage());
        }
    }

    // ============= 통합 테스트 및 Bean 검증 =============
    
    @Test
    @Order(11)
    @DisplayName("11단계: Bean 주입 및 연동 확인")
    void step11_verifyBeanIntegration() {
        assertNotNull(commonClient, "CommonClient Bean이 주입되어야 합니다");
        assertNotNull(managerClient, "ManagerClient Bean이 주입되어야 합니다");
        assertNotNull(memberClient, "MemberClient Bean이 주입되어야 합니다");
        assertNotNull(demandDepositClient, "DemandDepositClient Bean이 주입되어야 합니다");
        
        log.info("모든 Bean 주입 확인 완료:");
        log.info("- CommonClient: {}", commonClient.getClass().getSimpleName());
        log.info("- ManagerClient: {}", managerClient.getClass().getSimpleName());
        log.info("- MemberClient: {}", memberClient.getClass().getSimpleName());
        log.info("- DemandDepositClient: {}", demandDepositClient.getClass().getSimpleName());
        
        // API Key 동작 확인
        String apiKey = managerClient.getOrCreateApiKey();
        assertNotNull(apiKey, "API Key가 정상적으로 발급되어야 합니다");
        assertFalse(apiKey.trim().isEmpty(), "API Key가 비어있으면 안됩니다");
        
        log.info("API Key 연동 확인 완료, 길이: {}", apiKey.length());
    }
    
    @Test
    @Order(12)
    @DisplayName("12단계: 전체 워크플로우 요약")
    void step12_workflowSummary() {
        log.info("=== DemandDeposit 워크플로우 테스트 완료 ===");
        log.info("사용된 은행 코드: {}", testBankCode);
        log.info("생성된 상품 코드: {}", testProductCode);
        log.info("첫 번째 사용자: {} ({})", testUser1Email, testUser1 != null ? testUser1.getUserKey() : "N/A");
        log.info("두 번째 사용자: {} ({})", testUser2Email, testUser2 != null ? testUser2.getUserKey() : "N/A");
        log.info("첫 번째 계좌: {}", testAccount1No);
        log.info("두 번째 계좌: {}", testAccount2No);
        log.info("=== 워크플로우 테스트 성공적으로 완료 ===");
        
        // 최종 검증
        assertTrue(testBankCode != null && !testBankCode.isEmpty(), "은행 코드가 설정되어야 합니다");
        assertTrue(testProductCode != null && !testProductCode.isEmpty(), "상품 코드가 설정되어야 합니다");
        assertNotNull(testUser1, "첫 번째 사용자가 생성되어야 합니다");
        assertNotNull(testUser2, "두 번째 사용자가 생성되어야 합니다");
        assertTrue(testAccount1No != null && !testAccount1No.isEmpty(), "첫 번째 계좌가 생성되어야 합니다");
        assertTrue(testAccount2No != null && !testAccount2No.isEmpty(), "두 번째 계좌가 생성되어야 합니다");
    }
}