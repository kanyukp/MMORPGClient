import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports:[CommonModule, RouterModule, RouterLink, RouterOutlet],
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MMORPGClient';
}
