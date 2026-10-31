import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { CardsModule } from './cards/cards.module';
import { ColumnsModule } from './colums/columns.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [PrismaModule, AuthModule, BoardsModule, ColumnsModule, CardsModule, CommentsModule]
  // imports: [PrismaModule, AuthModule, BoardsModule],
   // <-- Добавили AuthModule
})
export class AppModule {}