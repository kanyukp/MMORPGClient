import { Inject, Injectable } from "@angular/core";
import { WebSocketSubject } from "rxjs/webSocket";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket$: WebSocketSubject<any>;
    public messages$ = new Subject<any>();

    connect(playerId: number) {
        console.log("Connecting to WebSocket...");
        this.socket$ = new WebSocketSubject(`ws://localhost:8080/game?entityId=${playerId}`);

        this.socket$.subscribe({
          next: (message) => this.messages$.next(message),
          error: (err) => {
            console.error('WebSocket error:', err);
          },
          complete: () => {
            console.warn('WebSocket connection closed');
          }
        });
    }

    sendMessage(message: any) {
        this.socket$.next(message);
    }
}
