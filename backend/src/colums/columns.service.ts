import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(boardId: string, dto: CreateColumnDto) {
    const lastColumn = await this.prisma.boardColumn.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const position = lastColumn ? lastColumn.position + 1 : 0;

    return this.prisma.boardColumn.create({
      data: {
        boardId,
        title: dto.title,
        position,
      },
    });
  }

  async findAllForBoard(boardId: string) {
    return this.prisma.boardColumn.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });
  }

  async update(id: string, dto: UpdateColumnDto) {
    return this.prisma.boardColumn.update({
      where: { id },
      data: { title: dto.title },
    });
  }

  async remove(id: string) {
    return this.prisma.boardColumn.delete({ where: { id } });
  }
}