// src/websocket/websocket.service.ts
import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';

@Injectable()
export class WebSocketService {
  private server: WebSocket.Server;
  private clients: WebSocket[] = [];

  constructor() {
    this.server = new WebSocket.Server({ port: 4000 });
    this.server.on('listening', () => {
      console.log('WebSocket server is listening on port 4000');
    });

    this.server.on('connection', (ws: WebSocket) => {
      console.log('Client connected');

      this.clients.push(ws);

      ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients = this.clients.filter(client => client !== ws);
      });
    });
  }

  async broadcastMessage(message:  Promise<string> | string) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
         client.send(typeof message === 'string' ? message : JSON.stringify(message))
      }
    });
  }
}
