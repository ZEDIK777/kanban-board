import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Участники (Members)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  addMember(@Param('boardId') boardId: string, @Body() dto: AddMemberDto) {
    return this.membersService.addMember(boardId, dto);
  }

  @Get()
  getMembers(@Param('boardId') boardId: string) {
    return this.membersService.getMembers(boardId);
  }
}