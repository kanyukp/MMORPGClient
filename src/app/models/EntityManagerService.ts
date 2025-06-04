// src/app/models/EntityManager.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Entity, Direction, Action } from './entity.model';
import { User } from '../services/LoginService';

@Injectable({
    providedIn: 'root'
})
export class EntityManager {
    private playerEntity = new BehaviorSubject<Entity | null>(null);
    public playerEntity$ = this.playerEntity.asObservable();

    createPlayerEntity(user: User): Entity {
        const entity = new Entity(
            user.id,          // id from user
            32,              // default width
            32,              // default height
            0,               // starting x
            0,               // starting y
            Direction.DOWN,  // default direction
            Action.IDLE,     // default action
            '',       // sprite will be set in game component
            user.username    // username from user
        );

        this.playerEntity.next(entity);
        return entity;
    }

    getCurrentPlayerEntity(): Entity | null {
        return this.playerEntity.getValue();
    }

    updatePlayerEntity(entity: Entity): void {
        this.playerEntity.next(entity);
    }
}
