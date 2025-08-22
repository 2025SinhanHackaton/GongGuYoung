package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.MemberRecord;

@Slf4j
@Component
@Validated
@RequiredArgsConstructor
public class MemberClientImpl implements MemberClient {

  private final ManagerClient managerClient;
  private final RestClient finOpenApiRestClient;

  @Override
  public MemberRecord getOrCreateMember(String userId) {
    return Optional.ofNullable(searchMember(userId))
        .orElseGet(() -> createMember(userId));
  }

  @Override
  public MemberRecord createMember(String userId) {
    String endPoint = "/member";
      log.debug("회원 생성: {}", userId);
    return finOpenApiRestClient.post()
        .uri(endPoint)
        .contentType(MediaType.APPLICATION_JSON)
        .body(Map.of("apiKey", managerClient.getOrCreateApiKey(), "userId", userId))
        .retrieve()
        .body(MemberRecord.class);
  }

  @Override
  public MemberRecord searchMember(String userId) {
    String endPoint = "/member/search";

    try {
        return finOpenApiRestClient.post()
          .uri(endPoint)
          .contentType(MediaType.APPLICATION_JSON)
          .body(Map.of("apiKey", managerClient.getOrCreateApiKey(), "userId", userId))
          .retrieve()
          .body(MemberRecord.class);

    } catch (Exception e) {
      log.info("회원 조회 실패");
      log.debug("회원 조회 실패: {}", userId);
      return null;
    }
  }
}
