import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { MembersService } from './members.service'; // <-- Добавили
import { MembersController } from './members.controller'; // <-- Добавили

@Module({
  controllers: [BoardsController, MembersController], // <-- Добавили
  providers: [BoardsService, MembersService], // <-- Добавили
})
export class BoardsModule {}