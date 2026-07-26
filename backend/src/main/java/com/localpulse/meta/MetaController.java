package com.localpulse.meta;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meta")
public class MetaController {

    @GetMapping("/categories")
    public List<String> categories() {
        return Categories.SUGGESTED;
    }
}
