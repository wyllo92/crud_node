import { Router } from "express";
import ModuleRoleController from '../controllers/moduleRole.controller.js';
const router = Router();
const name = '/moduleRole';

// Crear un nuevo permiso de módulo
router.route(name)
  .post(ModuleRoleController.create) // Crear
  .get(ModuleRoleController.show);   // Listar todos

router.route(`${name}/:id`)
  .get(ModuleRoleController.findById) // Buscar por ID
  .put(ModuleRoleController.update)   // Actualizar
  .delete(ModuleRoleController.delete); // Eliminar

export default router;