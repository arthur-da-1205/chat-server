import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway {
  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('createMessage')
  create(@MessageBody() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @SubscribeMessage('findAllMessage')
  findAll() {
    return this.messageService.findAll();
  }
}
