import { Inject, Injectable } from "@angular/core";
import { WebSocketSubject } from "rxjs/webSocket";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket$: WebSocketSubject<any>;
    public messages$ = new Subject<any>();

    connect() {
        this.socket$ = new WebSocketSubject('ws://localhost:8080/game');
        this.socket$.subscribe(
            (message) => this.messages$.next(message),
            (err) => console.error(err),
            () => console.warn('Completed!')
        );
    }
    sendMessage(message: any) {
        this.socket$.next(message);
    }
}