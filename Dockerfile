# Use Maven stage for building the application
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/campusbite2-0.0.1-SNAPSHOT.jar app.jar

# Create a data directory for the embedded H2 database
RUN mkdir ./data

# Expose the port (Render/Railway will override this with the PORT environment variable)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
