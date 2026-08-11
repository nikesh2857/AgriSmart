import prisma from '../config/prisma';

export const listTasks = async (userId: string) => {
  return prisma.task.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
};

export const createTask = async (userId: string, title: string, date: Date) => {
  return prisma.task.create({
    data: {
      userId,
      title,
      date,
    },
  });
};

export const updateTask = async (userId: string, taskId: string, status?: 'PENDING' | 'COMPLETED', title?: string) => {
  // Ensure the task belongs to the user
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error('Task not found');

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(status && { status }),
      ...(title && { title }),
    },
  });
};

export const deleteTask = async (userId: string, taskId: string) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new Error('Task not found');

  return prisma.task.delete({
    where: { id: taskId },
  });
};
