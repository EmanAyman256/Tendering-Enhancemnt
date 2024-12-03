import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  token=localStorage.getItem("token")

  constructor(private authService:AuthService,private router:Router){}
  isAuthenticated=false
  ngOnInit() {
    this.authService.loggedInUser.subscribe(user=>{
      this.isAuthenticated=!!user
    })
  }
 
  logout()
  {
    this.authService.logout()
  }

}
