package xyz.jinjin99.gongguyoung.backend.global.exception;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @Getter
    @AllArgsConstructor
    static class ErrorResponse{
        private int responseCode;
        private String responseMessage;
    }

    // 이미 존재하는 ID
    @ExceptionHandler(HttpClientErrorException.BadRequest.class)
    public ResponseEntity<ErrorResponse> handleHttpClientErrorException(HttpClientErrorException exception){

        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "이미 존재하는 ID 입니다" );
        return ResponseEntity.badRequest()
                .body(errorResponse);
    }


    @ExceptionHandler(MemberAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyExistsException(MemberAlreadyExistsException exception){

        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "이미 존재하는 ID 입니다" );
        return ResponseEntity.badRequest()
                .body(errorResponse);
    }

}
