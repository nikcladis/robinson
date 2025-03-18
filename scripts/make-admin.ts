import { prisma } from "@/helpers/prisma";

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    console.log(`Successfully made ${user.email} an admin`);
  } catch (error) {
    console.error("Error making user admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error("Please provide an email address");
  process.exit(1);
}

makeAdmin(email);
