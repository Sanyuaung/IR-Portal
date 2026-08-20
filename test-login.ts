import { prisma } from './src/lib/prisma';
import { AuthUtils } from './src/lib/auth';

async function test() {
  const email = 'sanyu.aung@kbzbank.com';
  const password = 'password';
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      twoFactorAuth: true,
    },
  });
  console.log("Found user via prisma:", user);
  if (!user) {
      console.log("No user found!");
      process.exit(1);
  }
  const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
  console.log("isPasswordValid:", isPasswordValid);
  process.exit(0);
}
test();
