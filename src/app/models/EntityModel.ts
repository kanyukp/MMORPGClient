// src/app/models/entity.model.ts
import { Sprite } from 'pixi.js';

export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    NONE = 'NONE'
}

export enum Action {
    MOVE = 'MOVE',
    IDLE = 'IDLE',
    ATTACK = 'ATTACK'
}

export class Entity {
    constructor(
        public id: number,
        public width: number = 32,
        public height: number = 32,
        public x: number = 0,
        public y: number = 0,
        public direction: Direction = Direction.DOWN,
        public currentAction: Action = Action.IDLE,
        public sprite: string,
        public username?: string
    ) {}
}
