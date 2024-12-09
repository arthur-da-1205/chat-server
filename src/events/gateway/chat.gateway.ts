import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Atur domain asal jika diperlukan
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: Map<string, string> = new Map(); // Map untuk menyimpan userId dan socketId

  async handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    const userId = this.getUserIdBySocket(socket.id);
    if (userId) {
      this.users.delete(userId);
      this.server.emit('user-disconnected', { userId });
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() { userId }: { userId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.users.set(userId, socket.id);
    console.log(`User registered: ${userId} with socketId: ${socket.id}`);
    this.server.emit('user-connected', { userId });
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody()
    {
      senderId,
      receiverId,
      message,
    }: { senderId: string; receiverId: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const receiverSocketId = this.users.get(receiverId);
    if (receiverSocketId) {
      this.server
        .to(receiverSocketId)
        .emit('receive-message', { senderId, message });
    } else {
      console.log(`User ${receiverId} not connected.`);
    }
  }

  private getUserIdBySocket(socketId: string): string | undefined {
    for (const [userId, sId] of this.users.entries()) {
      if (sId === socketId) return userId;
    }
    return undefined;
  }
}
