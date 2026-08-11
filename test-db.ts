import prisma from './src/backend/config/prisma';
async function main() {
  try {
    const count = await prisma.user.count();
    console.log("User count:", count);
  } catch (e: any) {
    console.error("DB Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
