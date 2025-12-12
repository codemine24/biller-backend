
import bcrypt from "bcrypt";
import { prisma } from "../shared/prisma";
import config from "../config";
import { UserRole } from "../../../prisma/generated";

const superAdmin = {
  name: config.super_admin_name,
  email: config.super_admin_email,
  contact_number: config.super_admin_contact_number,
  role: UserRole.SUPER_ADMIN,
};

export const seedSuperAdmin = async () => {
  const isExistSuperAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPER_ADMIN,
    },
  });

  if (isExistSuperAdmin) return;

  const hashedPassword = await bcrypt.hash(
    config.super_admin_default_pass,
    Number(config.salt_rounds)
  );

  await prisma.user.create({
    data: {
      ...superAdmin,
      password: hashedPassword,
    },
  });
};
