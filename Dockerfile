# 使用OpenJDK 8作为基础镜像
FROM openjdk:8-jdk-alpine

# 设置工作目录
WORKDIR /app

# 复制Maven包装器
COPY mvnw .
COPY .mvn .mvn

# 复制pom.xml
COPY pom.xml .

# 下载依赖（利用Docker缓存层）
RUN ./mvnw dependency:go-offline -B

# 复制源代码
COPY src src

# 构建应用
RUN ./mvnw clean package -DskipTests

# 暴露端口
EXPOSE 8080

# 创建上传目录
RUN mkdir -p /app/uploads

# 运行应用
CMD ["java", "-jar", "target/campus-second-hand-trade-1.0.0.jar"]
