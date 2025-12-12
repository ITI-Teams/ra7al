import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  public echo: Echo<any>;

  constructor() {
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: environment.pusherKey,
      cluster: environment.pusherCluster,
      forceTLS: true,
      encrypted: true,
    });
  }
}
