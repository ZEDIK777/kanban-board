import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем заполнение базы данных...');

  // 1. Создаем тестового пользователя
  const passwordHash = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@demo.demo' },
    update: {},
    create: {
      email: 'demo@demo.demo',
      name: 'Демо Пользователь',
      passwordHash,
    },
  });

  // 2. Создаем доску
  const board = await prisma.board.create({
    data: {
      title: 'Мой первый проект',
      ownerId: user.id,
      members: {
        create: { userId: user.id, role: 'OWNER' },
      },
    },
  });

  // 3. Создаем колонки
  const todoColumn = await prisma.boardColumn.create({
    data: { boardId: board.id, title: 'To Do', position: 0 },
  });
  const inProgressColumn = await prisma.boardColumn.create({
    data: { boardId: board.id, title: 'In Progress', position: 1 },
  });
  await prisma.boardColumn.create({
    data: { boardId: board.id, title: 'Done', position: 2 },
  });

  // 4. Создаем карточки
  await prisma.card.create({
    data: {
      boardId: board.id,
      columnId: todoColumn.id,
      title: 'Сделать дизайн главной страницы',
      description: 'Нужно нарисовать макет в Figma',
      position: 0,
      createdById: user.id,
      assigneeId: user.id,
    },
  });
  
  await prisma.card.create({
    data: {
      boardId: board.id,
      columnId: inProgressColumn.id,
      title: 'Настроить подключение к БД',
      position: 0,
      createdById: user.id,
    },
  });

  console.log('База данных успешно заполнена!');
  console.log('Логин: demo@demo.demo | Пароль: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });