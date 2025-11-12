package com.campus.trade.service;

import com.campus.trade.dto.JwtAuthenticationResponse;
import com.campus.trade.dto.LoginRequest;
import com.campus.trade.dto.SignupRequest;
import com.campus.trade.entity.User;
import com.campus.trade.entity.UserRole;
import com.campus.trade.entity.UserStatus;
import com.campus.trade.repository.UserRepository;
import com.campus.trade.security.UserPrincipal;
import com.campus.trade.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 认证服务类
 */
@Service
@Transactional
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 用户登录
     */
    public JwtAuthenticationResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userPrincipal);
        
        return new JwtAuthenticationResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getRole().name()
        );
    }
    
    /**
     * 用户注册
     */
    public User register(SignupRequest signupRequest) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRealName(signupRequest.getRealName());
        user.setPhone(signupRequest.getPhone());
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        
        return userRepository.save(user);
    }
    
    /**
     * 获取当前用户
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal() == null || 
            !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new RuntimeException("用户未认证");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    /**
     * 检查用户名是否可用
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }
    
    /**
     * 检查邮箱是否可用
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
    
    /**
     * 根据ID获取用户
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
}
