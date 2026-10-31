import { IsString, MinLength } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @MinLength(1, { message: 'Название доски не может быть пустым' })
  title: string;
}