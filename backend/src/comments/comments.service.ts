import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(cardId: string, authorId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        cardId,
        authorId,
        text: dto.text,
      },
      // Возвращаем вместе с данными автора (чтобы на фронте показать имя)
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  async findAllForCard(cardId: string) {
    return this.prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }
}