package com.campus.trade.controller;

import com.campus.trade.dto.ApiResponse;
import com.campus.trade.dto.JwtAuthenticationResponse;
import com.campus.trade.dto.LoginRequest;
import com.campus.trade.dto.SignupRequest;
import com.campus.trade.entity.User;
import com.campus.trade.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtAuthenticationResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(ApiResponse.success("登录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("登录失败: " + e.getMessage()));
        }
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            User user = authService.register(signupRequest);
            return ResponseEntity.ok(ApiResponse.success("注册成功", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("注册失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User user = authService.getCurrentUser();
            return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户信息失败: " + e.getMessage()));
        }
    }
    
    /**
     * 检查用户名是否可用
     */
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean available = authService.isUsernameAvailable(username);
        return ResponseEntity.ok(ApiResponse.success("检查完成", available));
    }
    
    /**
     * 检查邮箱是否可用
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.success("检查完成", available));
    }
}
