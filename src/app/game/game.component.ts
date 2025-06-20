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
  private pressedKeys: Set<string> = new Set();

    private readonly SPRITE_ASSETS = {
        charspritetest: 'assets/sprites/charspritetest.png',
        fireball: 'assets/sprites/fireball.png',
        Firebolt: 'assets/sprites/Firebolt.png',
       // playertest: 'assets/sprites/playertest.png',
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

            // Get the current entity from the login service
            this.currentEntity = this.loginService.getCurrentEntity() || undefined;

            // Subscribe to changes in case the entity gets updated
            this.entitySubscription = this.loginService.currentEntity$.subscribe(entity => {
                this.currentEntity = entity || undefined;
            });

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

            //console.log('Starting texture preload...');
            // Properly type the loaded textures
            const textures = await PIXI.Assets.load(Object.keys(this.SPRITE_ASSETS)) as Record<string, PIXI.Texture<PIXI.Resource>>;

            // Store loaded textures
            Object.entries(textures).forEach(([key, texture]) => {
                this.loadedTextures.set(key, texture);
            });

            //console.log('All textures loaded successfully');
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
    //console.log('Starting createAnimatedSprite for entity:', entity);

    // Get the base texture from our preloaded textures
    const spriteName = entity.sprite.replace('.png', '');
    const baseTexture = this.getTexture(spriteName).baseTexture;
    //console.log('Base texture retrieved:', baseTexture ? 'success' : 'failed');

    // Log the frames creation
    const frameWidth = entity.width;
    const frameHeight = entity.height;
    //console.log(`Creating frames with dimensions: ${frameWidth}x${frameHeight}`);

    const frames = [];
    let rowIndex = 0;

    switch (entity.direction) {
        case 'UP': rowIndex = 3; break;
        case 'DOWN': rowIndex = 0; break;
        case 'LEFT': rowIndex = 1; break;
        case 'RIGHT': rowIndex = 2; break;
    }
    //console.log('Using row index:', rowIndex);

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

    //console.log('Created frames:', frames.length);

    const animatedSprite = new PIXI.AnimatedSprite(frames);
    //console.log('AnimatedSprite created');

    // Log sprite properties before and after configuration
    //console.log('Before configuration:', {
//         x: animatedSprite.x,
//         y: animatedSprite.y,
//         width: animatedSprite.width,
//         height: animatedSprite.height,
//         visible: animatedSprite.visible,
//         parent: animatedSprite.parent
//     });

    this.configureSpriteProperties(animatedSprite, entity);

    //console.log('After configuration:', {
//         x: animatedSprite.x,
//         y: animatedSprite.y,
//         width: animatedSprite.width,
//         height: animatedSprite.height,
//         visible: animatedSprite.visible,
//         parent: animatedSprite.parent
//     });

    return animatedSprite;
}
   async createAnimatedSpriteProjectile(entity: any): Promise<PIXI.AnimatedSprite> {
    //console.log('Starting createAnimatedSprite for entity:', entity);

    // Get the base texture from our preloaded textures
    const spriteName = entity.sprite.replace('.png', '');
    const baseTexture = this.getTexture(spriteName).baseTexture;
    //console.log('Base texture retrieved:', baseTexture ? 'success' : 'failed');

    // Log the frames creation
    const frameWidth = entity.width;
    const frameHeight = entity.height;
    //console.log(`Creating frames with dimensions: ${frameWidth}x${frameHeight}`);

    const frames = [];
    let rowIndex = 0;

    switch (entity.direction) {
        case 'UP': rowIndex = 3; break;
        case 'DOWN': rowIndex = 0; break;
        case 'LEFT': rowIndex = 1; break;
        case 'RIGHT': rowIndex = 2; break;
    }
    //console.log('Using row index:', rowIndex);

    const NUMBER_OF_FRAMES = 4;
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

    //console.log('Created frames:', frames.length);

    const animatedSprite = new PIXI.AnimatedSprite(frames);
    //console.log('AnimatedSprite created');

    // Log sprite properties before and after configuration
    //console.log('Before configuration:', {
//         x: animatedSprite.x,
//         y: animatedSprite.y,
//         width: animatedSprite.width,
//         height: animatedSprite.height,
//         visible: animatedSprite.visible,
//         parent: animatedSprite.parent
//     });

    this.configureSpriteProperties(animatedSprite, entity);

    //console.log('After configuration:', {
//         x: animatedSprite.x,
//         y: animatedSprite.y,
//         width: animatedSprite.width,
//         height: animatedSprite.height,
//         visible: animatedSprite.visible,
//         parent: animatedSprite.parent
//     });

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
    const activeEntities = new Set<number>();


    // Collect ALL active entity IDs first
    if (message.currPlayer) {
        this.currentEntity = message.currPlayer;
//         console.log(message.currPlayer);
    }
    if (message.players) {
        message.players.forEach((player: Entity) => activeEntities.add(player.id));
    }
    if (message.projectiles) {
        message.projectiles.forEach((projectile: Entity) => activeEntities.add(projectile.id));
    }
    if (message.blocks) {
        message.blocks.forEach((block: Entity) => activeEntities.add(block.id));
    }

    // Now update/create entities
    if (message.players) {
        for (const player of message.players) {
            await this.updateOrCreateEntity(player);
        }
    }
    if (message.projectiles) await this.renderEntities(message.projectiles);
    if (message.blocks) await this.renderEntities(message.blocks);

    // Now remove only truly stale sprites
    for (const [id, sprite] of this.spriteInstances) {
        if (!activeEntities.has(id)) {
            this.app.stage.removeChild(sprite);
            this.spriteInstances.delete(id);
        }
    }
}
async updateOrCreateEntity(entity: any) {
    //console.log('Starting updateOrCreateEntity for entity:', entity);
    let sprite = this.spriteInstances.get(entity.id);
    let needNewSprite = false;

    // Check if we need to create a new sprite
    if (!sprite) {
        needNewSprite = true;
    } else if (
        (entity.currentAction === 'MOVE' && !(sprite instanceof PIXI.AnimatedSprite)) ||
        (entity.currentAction !== 'MOVE' && sprite instanceof PIXI.AnimatedSprite)
    ) {
        // Remove old sprite if we're switching between animated and static
        this.app.stage.removeChild(sprite);
        this.spriteInstances.delete(entity.id);
        needNewSprite = true;
    }

    if (needNewSprite) {
        //console.log('Creating new sprite for entity:', entity.id);
        if (entity.currentAction === 'MOVE') {
            sprite = await this.createAnimatedSprite(entity);
            //console.log('Animated sprite created:', sprite ? 'success' : 'failed');
        } else {
            sprite = await this.createStaticSprite(entity);
            //console.log('Static sprite created:', sprite ? 'success' : 'failed');
        }

        if (sprite) {
            //console.log('Adding sprite to stage. Current stage children:', this.app.stage.children.length);
            this.spriteInstances.set(entity.id, sprite);
            this.app.stage.addChild(sprite);
            //console.log('After adding sprite. Stage children:', this.app.stage.children.length);

            // Check if sprite was actually added to stage
            //console.log('Sprite stage status:', {
//                 isOnStage: this.app.stage.children.includes(sprite),
//                 visible: sprite.visible,
//                 alpha: sprite.alpha,
//                 renderable: sprite.renderable,
//                 worldVisible: sprite.worldVisible
//             });
        }
    }

    // At this point sprite should exist, but let's add a safety check
    if (!sprite) {
        console.error('Sprite is undefined for entity:', entity);
        return;
    }

    // Now we can safely update the sprite
    sprite.x = entity.x;
    sprite.y = entity.y;

    // Handle animation updates for animated sprites
    if (sprite instanceof PIXI.AnimatedSprite) {
        const prevDirection = (sprite as any).currentDirection;

        // Only update frames if direction changed
        if (prevDirection !== entity.direction) {
            const spriteName = entity.sprite.replace('.png', '');
            const baseTexture = this.getTexture(spriteName).baseTexture;
            const frames = [];
            let rowIndex = 0;

            switch (entity.direction) {
            case 'UP': rowIndex = 3; break;
            case 'DOWN': rowIndex = 0; break;
            case 'LEFT': rowIndex = 1; break;
            case 'RIGHT': rowIndex = 2; break;
            }

            const NUMBER_OF_FRAMES = 3;
            for (let i = 0; i < NUMBER_OF_FRAMES; i++) {
                const frame = new PIXI.Texture(
                    baseTexture,
                    new PIXI.Rectangle(
                        i * entity.width,
                        rowIndex * entity.height,
                        entity.width,
                        entity.height
                    )
                );
                frames.push(frame);
            }

            sprite.textures = frames;
            (sprite as any).currentDirection = entity.direction;
        }

        // Ensure animation is playing while moving
        if (entity.currentAction === 'MOVE' && !sprite.playing) {
            sprite.play();
        } else if (entity.currentAction !== 'MOVE' && sprite.playing) {
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
    const spriteName = entity.sprite.replace('.png', '');
    const baseTexture = this.getTexture(spriteName).baseTexture;

    // Determine which row to use based on direction
    let rowIndex = 0;
    switch (entity.direction) {
        case 'UP': rowIndex = 3; break;
        case 'DOWN': rowIndex = 0; break;
        case 'LEFT': rowIndex = 1; break;
        case 'RIGHT': rowIndex = 2; break;
    }

    // Create a texture that only shows the first frame of the appropriate row
    const frameTexture = new PIXI.Texture(
        baseTexture,
        new PIXI.Rectangle(
            0,                  // x position (first frame)
            rowIndex * entity.height,  // y position (row based on direction)
            entity.width,       // width of one frame
            entity.height       // height of one frame
        )
    );

    const sprite = new PIXI.Sprite(frameTexture);
    sprite.x = entity.x;
    sprite.y = entity.y;
    sprite.width = entity.width;
    sprite.height = entity.height;

    return sprite;
}



  async renderEntities(entities: any[]) {
    // Track active entity IDs
    const activeEntityIds = new Set<number>();

    for (const entity of entities) {
        activeEntityIds.add(entity.id);
        let sprite = this.spriteInstances.get(entity.id);

        if (!sprite) {
            // Create new sprite if it doesn't exist
            if (entity.currentAction === 'MOVE') {
                sprite = await this.createAnimatedSprite(entity);
            } else if(entity.sprite == "Firebolt.png"){
                sprite = await this.createAnimatedSprite(entity);
            } else {
              sprite = await this.createStaticSprite(entity);
            }
            if (sprite) {
                this.spriteInstances.set(entity.id, sprite);
                this.app.stage.addChild(sprite);
            }
        } else {
            // Update existing sprite position
            sprite.x = entity.x;
            sprite.y = entity.y;
        }
    }

    // Remove sprites for entities that no longer exist
//     for (const [id, sprite] of this.spriteInstances) {
//         if (!activeEntityIds.has(id)) {
//             console.log("Removing entity!");
//             this.app.stage.removeChild(sprite);
//             this.spriteInstances.delete(id);
//         }
//     }
}

  onKeyDown(event: KeyboardEvent){
    let action;
    const key = event.key.toLowerCase();
    this.pressedKeys.add(key);

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
      case ' ':
        action = {actionType: 'ATTACK' , direction: this.currentEntity?.direction, playerId: this.currentEntity?.id };
        //console.log("This.currentDirection: " +  this.currentDirection);
        console.log("curentEntity.direction: "+ this.currentEntity?.direction);
        break;
    }
    if (action) {
      this.webSocketService.sendMessage(action);
    }
  }
// Add this new method
  onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.pressedKeys.delete(key);
    //console.log("Checking key up");
    // Check if no movement keys are pressed
    if (!['w', 'a', 's', 'd'].some(k => this.pressedKeys.has(k))) {
        //console.log("shoud set idle");
        const action = {
            actionType: 'IDLE',
            direction: this.currentEntity?.direction || 'DOWN',
            playerId: this.currentEntity?.id
        };
        this.webSocketService.sendMessage(action);
    }
  }


}
