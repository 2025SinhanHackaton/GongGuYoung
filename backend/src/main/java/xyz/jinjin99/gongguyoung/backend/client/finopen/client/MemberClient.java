package xyz.jinjin99.gongguyoung.backend.client.finopen.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.MemberRecord;

public interface MemberClient {
  MemberRecord getOrCreateMember(@NotBlank @Email String userId);
  MemberRecord createMember(@NotBlank @Email String userId) ;
  MemberRecord searchMember(@NotBlank @Email String userId) ;
}
