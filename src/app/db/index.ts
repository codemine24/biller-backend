
import bcrypt from "bcrypt";
import { prisma } from "../shared/prisma";
import config from "../config";
import { UserRole } from "../../../prisma/generated";

const owner = {
  first_name: config.owner_first_name,
  email: config.owner_email,
  contact_number: config.owner_contact_number,
  role: UserRole.OWNER,
};

export const seedOwner = async () => {
  const isExistOwner = await prisma.user.findFirst({
    where: {
      role: UserRole.OWNER,
    },
  });

  if (isExistOwner) return;

  const hashedPassword = await bcrypt.hash(
    config.owner_default_pass,
    Number(config.salt_rounds)
  );

  await prisma.user.create({
    data: {
      ...owner,
      password: hashedPassword,
    },
  });
};
