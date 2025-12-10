import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserControllers } from "./User.controllers";
import { UserSchemas } from "./User.schemas";
import { fileUploader } from "../../utils/file-uploader";
import { UserRole } from "../../../generated/prisma/enums";
import payloadValidator from "../../middlewares/payload-validator";
import formDataValidator from "../../middlewares/form-data-validator";

const router = Router();

router.post(
  "/add-user",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  payloadValidator(UserSchemas.addUserByAdmin),
  UserControllers.addUserByAdmin
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserControllers.getUsers
);

router.get(
  "/profile",
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.RETAILER,
    UserRole.CONSUMER
  ),
  UserControllers.getProfile
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserControllers.getUser
);

router.patch(
  "/update-profile",
  auth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.RETAILER,
    UserRole.CONSUMER
  ),
  fileUploader.singleUpload.single("profile_pic"),
  formDataValidator(UserSchemas.updateProfile),
  UserControllers.updateProfile
);

router.patch(
  "/update-user/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  payloadValidator(UserSchemas.updateUserByAdmin),
  UserControllers.updateUserByAdmin
);

export const UserRoutes = router;
