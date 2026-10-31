import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @MinLength(1, { message: 'Название карточки не может быть пустым' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Некорректный ID исполнителя' })
  assigneeId?: string;

  @IsOptional()
  @IsString()
  dueDate?: string; // Дата приходит как строка в формате ISO (например, "2024-12-31")
}