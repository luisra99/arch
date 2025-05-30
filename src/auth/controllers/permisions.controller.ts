import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";
const prisma = new PrismaClient();

export const updateUserPermissions = async (req: Request, res: Response) => {
    const { userId, permissionIds } = req.body;

    try {
        // Eliminar todos los permisos actuales del usuario
        await prisma.userPermission.deleteMany({
            where: { userId }
        });

        // Crear nuevos permisos para el usuario
        const newPermissions = permissionIds.map((permissionId: string) => ({
            userId,
            permissionId
        }));
        await prisma.userPermission.createMany({
            data: newPermissions
        });

        res.status(200).json({ message: 'Permisos actualizados correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar los permisos del usuario' });
    }
};
export const updateUserAreas = async (req: Request, res: Response) => {
    const { userId, areasId } = req.body;

    try {
        // Eliminar todos los permisos actuales del usuario
        await prisma.areaUser.deleteMany({
            where: { userId }
        });

        // Crear nuevos permisos para el usuario
        const newUserAreaRelation = areasId.map((areaId: string) => ({
            userId,
            areaId
        }));
        await prisma.areaUser.createMany({
            data: newUserAreaRelation
        });

        res.status(200).json({ message: 'Areas actualizadas correctamente' });
    } catch (error) {
        logger.error(`Error al actualizar las áreas del usuario: ${error}
        [req.body]:${JSON.stringify(req.body)}`); // Loguear el error
        res.status(500).json({ error: 'Error al actualizar los permisos del usuario' });
    }
};
export const listUserPermissions = async (req: Request, res: Response) => {

    try {
        // Eliminar todos los permisos actuales del usuario
        const permissions = await prisma.permission.findMany();



        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los permisos del usuario' });
    }
};
export const listUserPermissionsByID = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        // Eliminar todos los permisos actuales del usuario
        const permissions = await prisma.permission.findMany({ where: { users: { some: { userId: { equals: id } } } } });
        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los permisos del usuario' });
    }
};

export const listUserAreaByID = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        // Eliminar todos los permisos actuales del usuario
        const permissions = await prisma.area.findMany({ where: { AreaUser: { some: { userId: { equals: id } } } } });
        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar los permisos del usuario' });
    }
};