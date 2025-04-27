import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  username: string = "";
  password: string = "";
  message: string = "";

  constructor( private http: HttpClient, private router: Router) {}

  login() {
    this.http.post('api/auth/login', { username: this.username, password: this.password })
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
    this.http.post('api/auth/register', { username: this.username, password: this.password })
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
