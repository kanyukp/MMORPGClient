import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { WebSocketService } from '../services/websocket.service';
import * as PIXI from 'pixi.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Add FormsModule, etc., if needed
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit {

  @ViewChild('gameContainer', {static:true}) gameContainer: ElementRef<HTMLDivElement>;
  private app: PIXI.Application;

  constructor(private webSocketService: WebSocketService) {}

  ngAfterViewInit(): void {
    if (!this.gameContainer?.nativeElement) {
      console.error('Game container not found');
      return;
    }

    try {
      // Debug PIXI.js module
      console.log('PIXI Version:', PIXI.VERSION);
      console.log('PIXI.Application:', PIXI.Application);
      console.log('PIXI Module Keys:', Object.keys(PIXI));

      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL not supported in this browser');
      }

      // Initialize PIXI Application
      this.app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x000000,
        antialias: true
      });

      // Verify app and view
      if (!this.app || !this.app.view) {
        throw new Error('PIXI Application or view not initialized');
      }

  // Append the canvas
this.gameContainer.nativeElement.appendChild(this.app.view as HTMLCanvasElement);
console.log('Canvas appended:', this.app.view);

      // Auto-focus for keyboard input
      this.gameContainer.nativeElement.focus();

      // Connect to WebSocket
      this.webSocketService.connect();
      this.webSocketService.messages$.subscribe((message) => this.handleGameUpdate(message));
    } catch (error) {
      console.error('PIXI Initialization Error:', error);
    }
  }


  

  // ngOnInit(): void {
  //   this.app = new PIXI.Application({width:800, height:600});
  //   this.gameContainer.nativeElement.appendChild(this.app.view);

  //   this.webSocketService.connect();
  //   this.webSocketService.messages$.subscribe((message) => this.handleGameUpdate(message));
  // }

  handleGameUpdate(message:any) {
    this.app.stage.removeChildren();

    this.renderEntities(message.players);
    this.renderEntities(message.projectiles);
    this.renderEntities(message.blocks);

  }
  renderEntities(entities: any[]) {
    entities.forEach(entity => {
      if (entity.currenActoin === 'Move') {
        this.renderMovingAnimation(entity);
      } else {
        this.renderStaticSprite(entity);
      }
    });
  }
  renderMovingAnimation(entity: any){
    const texture = PIXI.Texture.from(""/* TODO ${entity.sprite} + file location*/);
    const frameWidth = entity.width;
    const frameHeight = entity.height;
    const frames = [];
    let rowIndex = 0;

    switch (entity.direction) {
      case 'UP':
        rowIndex = 0;
        break;
      case 'DOWN':
        rowIndex = 1;
        break;
      case 'LEFT':
        rowIndex = 2;
        break;
      case 'RIGHT':
        rowIndex = 3;
        break;
    }
   
    const NUMBER_OF_FRAMES = 8;
  for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
    const frameRect = new PIXI.Rectangle(
      i * frameWidth,
      rowIndex * frameHeight,
      frameWidth,
      frameHeight
    );
    const frame = new PIXI.Texture(texture.baseTexture, frameRect); // 👈 old constructor
    frames.push(frame);
  }

  const animatedSprite = new PIXI.AnimatedSprite(frames);
  animatedSprite.x = entity.x;
  animatedSprite.y = entity.y;
  animatedSprite.width = entity.width;
  animatedSprite.height = entity.height;
  animatedSprite.animationSpeed = 0.1;
  animatedSprite.play();

  this.app.stage.addChild(animatedSprite);
  }

  renderStaticSprite(entity:any){
    const texture = PIXI.Texture.from(""/* TODO ${entity.sprite} + file location*/);
    const sprite = new PIXI.Sprite(texture);
    sprite.x= entity.x;
    sprite.y = entity.y;
    sprite.width = entity.width;
    sprite.height = entity.height;
    this.app.stage.addChild(sprite);
  }

  onKeyDown(event: KeyboardEvent){
    let action;
    switch (event.key) {
      case 'W':
        action = {type: 'MOVE' , direction: 'UP'};
        console.log("typing w");
        break;
      case 'S':
        action = {type: 'MOVE' , direction: 'DOWN'};
        break;
      case 'A':
        action = {type: 'MOVE' , direction: 'LEFT'};
        break;
      case 'D':
        action = {type: 'MOVE' , direction: 'RIGHT'};
        break;
    }
    if (action) {
      this.webSocketService.sendMessage(action);
    }
  }

}
