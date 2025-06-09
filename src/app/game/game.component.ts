import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { WebSocketService } from '../services/websocket.service';
import * as PIXI from 'pixi.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginService, User } from '../services/LoginService';
import { Subscription } from 'rxjs';
import { Entity, Direction, Action } from '../models/EntityModel';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Add FormsModule, etc., if needed
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit {

  currentEntity?: Entity;
  private entitySubscription?: Subscription;

    private readonly SPRITE_ASSETS = {
        charspritetest: 'assets/sprites/charspritetest.png',
        fireball: 'assets/sprites/fireball.png',
        firebolt: 'assets/sprites/Firebolt.png',
        playertest: 'assets/sprites/playertest.png',
        testmap: 'assets/sprites/TestMap.png'
    };

    // Properly type the textures Map
    private loadedTextures: Map<string, PIXI.Texture<PIXI.Resource>> = new Map();

      private spriteInstances: Map<number, PIXI.AnimatedSprite | PIXI.Sprite> = new Map();


  @ViewChild('gameContainer', {static:true}) gameContainer: ElementRef<HTMLDivElement>;
  private app: PIXI.Application;

  constructor(private webSocketService: WebSocketService, private loginService: LoginService) {
    // Pre-load your textures
    PIXI.Assets.add('playerSprite', '/assets/sprites/playertest.png');
    // Add other sprites as needed
}

  async ngAfterViewInit() {
        try {
            // Initialize PIXI application first
            this.initPixiApp();

            // Preload all textures
            await this.preloadTextures();

            // Connect to WebSocket only after textures are loaded
            this.webSocketService.connect(this.currentEntity?.id || 0);
            this.webSocketService.messages$.subscribe((message) => this.handleGameUpdate(message));

        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    private initPixiApp() {
        if (!this.gameContainer?.nativeElement) {
            throw new Error('Game container not found');
        }

        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0xFFFFFF,
            antialias: true
        });

        this.gameContainer.nativeElement.appendChild(this.app.view as HTMLCanvasElement);
    }

    private async preloadTextures() {
        try {
            // Add all assets to PIXI loader
            Object.entries(this.SPRITE_ASSETS).forEach(([key, path]) => {
                PIXI.Assets.add(key, path);
            });

            console.log('Starting texture preload...');
            // Properly type the loaded textures
            const textures = await PIXI.Assets.load(Object.keys(this.SPRITE_ASSETS)) as Record<string, PIXI.Texture<PIXI.Resource>>;

            // Store loaded textures
            Object.entries(textures).forEach(([key, texture]) => {
                this.loadedTextures.set(key, texture);
            });

            console.log('All textures loaded successfully');
        } catch (error) {
            console.error('Error preloading textures:', error);
            throw error;
        }
    }

    // Update the return type of getTexture
    private getTexture(spriteName: string): PIXI.Texture<PIXI.Resource> {
        const texture = this.loadedTextures.get(spriteName);
        if (!texture) {
            throw new Error(`Texture not found for sprite: ${spriteName}`);
        }
        return texture;
    }

    async createAnimatedSprite(entity: any): Promise<PIXI.AnimatedSprite> {
        // Get the base texture from our preloaded textures
        const spriteName = entity.sprite.replace('.png', '');
        const baseTexture = this.getTexture(spriteName).baseTexture;

        // Create frames
        const frameWidth = entity.width;
        const frameHeight = entity.height;
        const frames = [];
        let rowIndex = 0;

        switch (entity.direction) {
            case 'UP': rowIndex = 0; break;
            case 'DOWN': rowIndex = 1; break;
            case 'LEFT': rowIndex = 2; break;
            case 'RIGHT': rowIndex = 3; break;
        }

        const NUMBER_OF_FRAMES = 8;
        for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
            const frame = new PIXI.Texture(
                baseTexture,
                new PIXI.Rectangle(
                    i * frameWidth,
                    rowIndex * frameHeight,
                    frameWidth,
                    frameHeight
                )
            );
            frames.push(frame);
        }

        const animatedSprite = new PIXI.AnimatedSprite(frames);
        this.configureSpriteProperties(animatedSprite, entity);
        return animatedSprite;
    }

    private configureSpriteProperties(sprite: PIXI.Sprite | PIXI.AnimatedSprite, entity: any) {
        sprite.x = entity.x;
        sprite.y = entity.y;
        sprite.width = entity.width;
        sprite.height = entity.height;

        if (sprite instanceof PIXI.AnimatedSprite) {
            sprite.animationSpeed = 0.1;
            sprite.play();
        }
    }


    ngOnDestroy() {
      this.entitySubscription?.unsubscribe();
    }


  // ngOnInit(): void {
  //   this.app = new PIXI.Application({width:800, height:600});
  //   this.gameContainer.nativeElement.appendChild(this.app.view);

  //   this.webSocketService.connect();
  //   this.webSocketService.messages$.subscribe((message) => this.handleGameUpdate(message));
  // }


async handleGameUpdate(message: any) {
//     this.app.stage.removeChildren();
    console.log(message);

    // Keep track of active entities to remove stale sprites
    const activeEntities = new Set<number>();


    if (message.players) {
                for (const player of message.players) {
                    activeEntities.add(player.id);
                    await this.updateOrCreateEntity(player);
                }
            }
    if (message.projectiles) await this.renderEntities(message.projectiles);
    if (message.blocks) await this.renderEntities(message.blocks);
    // Remove sprites of entities that no longer exist
            for (const [id, sprite] of this.spriteInstances) {
                if (!activeEntities.has(id)) {
                    this.app.stage.removeChild(sprite);
                    this.spriteInstances.delete(id);
                }
            }

}
async updateOrCreateEntity(entity: any) {
        let sprite = this.spriteInstances.get(entity.id);

        if (!sprite) {
            // Create new sprite if it doesn't exist
            if (entity.currentAction === 'MOVE') {
                sprite = await this.createAnimatedSprite(entity);
            } else {
                sprite = await this.createStaticSprite(entity);
            }
            this.spriteInstances.set(entity.id, sprite);
            this.app.stage.addChild(sprite);
        }

        // Update sprite properties
        sprite.x = entity.x;
        sprite.y = entity.y;

        // Handle animation state changes
        if (sprite instanceof PIXI.AnimatedSprite) {
            if (entity.currentAction === 'MOVE') {
                if (!sprite.playing) {
                    sprite.play();
                }
            } else {
                sprite.stop();
            }
        }
    }
//  async createAnimatedSprite(entity: any): Promise<PIXI.AnimatedSprite> {
//          // Get the base texture from our preloaded textures
//          const spriteName = entity.sprite.replace('.png', '');
//          const baseTexture = this.getTexture(spriteName).baseTexture;
//
//          // Create frames
//          const frameWidth = entity.width;
//          const frameHeight = entity.height;
//          const frames = [];
//          let rowIndex = 0;
//
//          switch (entity.direction) {
//              case 'UP': rowIndex = 0; break;
//              case 'DOWN': rowIndex = 1; break;
//              case 'LEFT': rowIndex = 2; break;
//              case 'RIGHT': rowIndex = 3; break;
//          }
//
//          const NUMBER_OF_FRAMES = 8;
//          for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
//              const frame = new PIXI.Texture(
//                  baseTexture,
//                  new PIXI.Rectangle(
//                      i * frameWidth,
//                      rowIndex * frameHeight,
//                      frameWidth,
//                      frameHeight
//                  )
//              );
//              frames.push(frame);
//          }
//
//          const animatedSprite = new PIXI.AnimatedSprite(frames);
//          this.configureSpriteProperties(animatedSprite, entity);
//          return animatedSprite;
//      }

    async createStaticSprite(entity: any): Promise<PIXI.Sprite> {
            const spritePath = `/assets/sprites/${entity.sprite}`;
            const texture = await PIXI.Assets.load(spritePath);
            const sprite = new PIXI.Sprite(texture);

            sprite.x = entity.x;
            sprite.y = entity.y;
            sprite.width = entity.width;
            sprite.height = entity.height;

            return sprite;
        }



  renderEntities(entities: any[]) {
    entities.forEach(entity => {
      if (entity.currentAction === 'MOVE') {
        //console.log("Moving!!!!");
        this.renderMovingAnimation(entity);
      } else {
        this.renderStaticSprite(entity);
      }
    });
  }
  async renderMovingAnimation(entity: any) {
    try {
        const spritePath = `/assets/sprites/${entity.sprite}`;
        const baseTexture = await PIXI.Assets.load(spritePath);

        const frameWidth = entity.width;
        const frameHeight = entity.height;
        const frames = [];
        let rowIndex = 0;

        switch (entity.direction) {
            case 'UP':
                rowIndex = 3;
                break;
            case 'DOWN':
                rowIndex = 0;
                break;
            case 'LEFT':
                rowIndex = 1;
                break;
            case 'RIGHT':
                rowIndex = 2;
                break;
        }

        const NUMBER_OF_FRAMES = 3;
        for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
            const frame = new PIXI.Texture(
                baseTexture,
                new PIXI.Rectangle(
                    i * frameWidth,
                    rowIndex * frameHeight,
                    frameWidth,
                    frameHeight
                )
            );
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
    } catch (error) {
        console.error('Error in renderMovingAnimation:', error);
        // Fallback to static sprite if animation fails
        await this.renderStaticSprite(entity);
    }
}

  async renderStaticSprite(entity: any) {
    try {
        if (!entity.sprite) {
            console.error('No sprite property found on entity:', entity);
            return;
        }

        // Make sure the path starts with a forward slash
        const spritePath = `/assets/sprites/${entity.sprite}`;
        // console.log('Loading sprite from:', spritePath);

        // Load the texture
        const texture = await PIXI.Assets.load(spritePath);
        const sprite = new PIXI.Sprite(texture);

        sprite.x = entity.x;
        sprite.y = entity.y;
        sprite.width = entity.width;
        sprite.height = entity.height;

        this.app.stage.addChild(sprite);
    } catch (error) {
        console.error('Error rendering sprite:', error);
        console.error('Entity that caused error:', entity);
    }
}

  onKeyDown(event: KeyboardEvent){
    let action;
    // console.log("keyboard event");

    switch (event.key) {
      case 'w':
        action = {actionType: 'MOVE' , direction: 'UP', playerId: this.currentEntity?.id };
        // console.log("typing w");
        break;
      case 's':
        action = {actionType: 'MOVE' , direction: 'DOWN', playerId: this.currentEntity?.id };
        break;
      case 'a':
        action = {actionType: 'MOVE' , direction: 'LEFT', playerId: this.currentEntity?.id };
        break;
      case 'd':
        action = {actionType: 'MOVE' , direction: 'RIGHT', playerId: this.currentEntity?.id };
        break;
    }
    if (action) {
      this.webSocketService.sendMessage(action);
    }
  }

}
