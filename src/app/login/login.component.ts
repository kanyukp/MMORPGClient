import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService, User } from '../services/LoginService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username: string = "";
  password: string = "";
  message: string = "";
  loggedInUser?: User;


  constructor( private http: HttpClient, private router: Router, private loginService:LoginService) {}

  login(): void {
    this.loginService.login(this.username, this.password).subscribe({
      next: (data) => {
        if (typeof data === 'string') {
          this.message = data; // unexpected string (shouldn't happen, but guarded)
        } else {
          this.loggedInUser = data;
          this.message = `Welcome, ${data.username}!`;
          this.router.navigate(['game']);
          // Optionally store in localStorage/sessionStorage
        }
      },
      error: (err: HttpErrorResponse) => {
        this.message = err.error || 'Login failed. Please try again.';
        this.loggedInUser = undefined;
      }
    });
    }
  register() {
    this.http.post('http://localhost:8080/api/auth/register', { username: this.username, password: this.password })
      .subscribe(
        () => {
          this.message = 'User registered successfully. Please login.';
        },
        (error) => {
          this.message = 'Username already exists. Please choose another.';
        }
      );
  }
}

// login() {
//   this.http.post('api/auth/login', {username: this.username, password: this.password })
//         .subscribe( 
//         { 
//           next: () => this.router.navigate(['game']),
//           error: () => this.message = 'User not found.',
//           complete: 
//         }, 
//         (error) => {
//           this.message = 'User not found.';
//         }
//       );
//   }
