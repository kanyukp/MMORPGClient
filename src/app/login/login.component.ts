import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor( private http: HttpClient, private router: Router) {}

  login() {
    this.http.post('http://localhost:8080/api/auth/login', { username: this.username, password: this.password })
          .subscribe( 
          () => {
            this.router.navigate(['game']);
          }, 
          (error) => {
            this.message = 'User not found.';
          }
        );
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
