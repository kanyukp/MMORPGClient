import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { WebSocketService } from '../services/websocket.service';
import * as PIXI from 'pixi.js'; 

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {

  @ViewChild('gameContainer', {static:true}) gameContainer: ElementRef<HTMLDivElement>;
  private app: PIXI.Application;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.app = new PIXI.Application({width:800, height:600});
    this.gameContainer.nativeElement.appendChild(this.app.view);

    this.webSocketService.connect();
    this.webSocketService.messages$.subscribe((message) => this.handleGameUpdate(message));
  }

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
    let NUMBER_OF_FRAMES = 8;
    for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
      let temp = new PIXI.Rectangle(i * frameWidth, rowIndex * frameHeight, frameWidth, frameHeight)
      const frame = new PIXI.Texture.from(texture.baseTexture, temp);  //TODO FIX
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
