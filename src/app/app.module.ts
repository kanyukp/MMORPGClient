import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from './services/websocket.service';
import { GameComponent } from './game/game.component';
import { LoginComponent } from './login/login.component';
import { LoginService } from './services/LoginService';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    GameComponent, // Standalone component
    LoginComponent, // Standalone component
    AppComponent

  ],
  providers: [WebSocketService, LoginService],
  bootstrap: []
})
export class AppModule {}