import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  passwordHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/register`, { username, password })
      .pipe(
        catchError(this.handleError)
      );
  }

  login(username: string, password: string): Observable<User | string> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password }, {
      observe: 'response'
    }).pipe(
      map(response => response.body!),
      catchError(err => {
        return throwError(() => err.error); // Propagate error string
      })
    );
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = error.status === 401
        ? 'Invalid username or password'
        : `Server error: ${error.status} - ${error.error.message || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}