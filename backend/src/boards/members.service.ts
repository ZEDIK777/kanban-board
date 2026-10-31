import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async addMember(boardId: string, dto: AddMemberDto) {
    // 1. Ищем пользователя по email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('Пользователь с таким email не найден');

    // 2. Проверяем, не добавлен ли он уже
    const existingMember = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: user.id } },
    });
    if (existingMember) throw new ConflictException('Пользователь уже добавлен на доску');

    // 3. Добавляем
    return this.prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role: 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getMembers(boardId: string) {
    return this.prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}