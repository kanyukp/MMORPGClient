import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Entity } from '../models/EntityModel';

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
  private currentEntitySubject = new BehaviorSubject<Entity | null>(null);
  currentEntity$ = this.currentEntitySubject.asObservable()

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<Entity | string> {
    return this.http.post<Entity>(`${this.apiUrl}/login`, { username, password }, {
      observe: 'response'
    }).pipe(
      map(response => {
        const entity = response.body!;
        this.currentEntitySubject.next(entity); // Store the user
        return entity;
      }),
      catchError(err => {
        return throwError(() => err.error);
      })
    );
  }

  register(username: string, password: string): Observable<Entity | string> {
    return this.http.post<Entity>(`${this.apiUrl}/register`, { username, password }, {
            observe: 'response'
    }).pipe(
            map(response => {
                    const entity = response.body!;
                    this.currentEntitySubject.next(entity);// Store the user
                    return entity;
                  }),
                  catchError(err => {
                    return throwError(() => err.error);
                  })
        );
  }


  getCurrentEntity(): Entity | null {
    return this.currentEntitySubject.getValue();
  }

  logout() {
    this.currentEntitySubject.next(null);
  }
}
