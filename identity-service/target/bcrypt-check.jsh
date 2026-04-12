import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
var enc = new BCryptPasswordEncoder();
System.out.println(enc.matches("admin123", "$2a$10$2Z1A05NDY.7IuxJS29QjQOvTvfphzpfoHo2t5M1qZ.U7LZd5eJ6pO"));
/exit
