package com.localpulse;

import com.localpulse.config.CorsProperties;
import com.localpulse.config.JwtProperties;
import com.localpulse.config.ListingProperties;
import com.localpulse.config.OtpProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({JwtProperties.class, OtpProperties.class, ListingProperties.class, CorsProperties.class})
public class LocalPulseApplication {



	public static void main(String[] args) {
		SpringApplication.run(LocalPulseApplication.class, args);
	}

}
