import { IsString, MinLength } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @MinLength(1, { message: 'Название колонки не может быть пустым' })
  title: string;
}