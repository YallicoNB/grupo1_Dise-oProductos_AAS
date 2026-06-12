package com.antonela.art;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AntonelaArtApplication {

    public static void main(String[] args) {
        SpringApplication.run(AntonelaArtApplication.class, args);
    }
}
