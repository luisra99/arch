import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const listUsersController = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { username: "asc" },
      where: { idRole: { not: null } },
    });
    res.status(200).json(users);
  } catch (error) {

    res.status(500).json(error);
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const users = await prisma.user.update({
      where: { id },
      data: { idRole: null },
    });
    res.status(200).json(users);
  } catch (error) {

    res.status(500).json(error);
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const users = await prisma.user.update({
      where: { id },
      data: { username: req.body.username, password: hashedPassword },
    });
    res.status(200).json(users);
  } catch (error) {

    res.status(500).json(error);
  }
};
