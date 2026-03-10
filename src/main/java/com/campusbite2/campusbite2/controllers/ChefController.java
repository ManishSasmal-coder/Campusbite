package com.campusbite2.campusbite2.controllers;

import com.campusbite2.campusbite2.repositories.ChefRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin( origins = "*")
public class ChefController {
    @Autowired
    ChefRepo chefRepo;
}
