import ModuleRoleModel from '../models/moduleRole.model.js';

class ModuleRoleController {
  
  static async create(req, res) {
    try {
      const { module_fk, role_user_fk, can_view, can_create, can_edit, can_delete } = req.body;
      const insertId = await ModuleRoleModel.create({ module_fk, role_user_fk, can_view, can_create, can_edit, can_delete });

      if (insertId === 0) {
        return res.status(400).json({ message: 'Error al crear el permiso del módulo.' });
      }

      res.status(201).json({ message: 'Permiso del módulo creado correctamente.', insertId });
    } catch (error) {
      console.error('Error en create controller:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  static async show(req, res) {
    try {
      const roles = await ModuleRoleModel.show();

      if (roles.length === 0) {
        return res.status(404).json({ message: 'No se encontraron permisos.' });
      }

      res.status(200).json(roles);
    } catch (error) {
      console.error('Error en show controller:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { can_view, can_create, can_edit, can_delete } = req.body;

      const updated = await ModuleRoleModel.update(id, { can_view, can_create, can_edit, can_delete });

      if (updated === 0) {
        return res.status(404).json({ message: 'Permiso no encontrado o sin cambios.' });
      }

      res.status(200).json({ message: 'Permiso actualizado correctamente.' });
    } catch (error) {
      console.error('Error en update controller:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ModuleRoleModel.delete(id);

      if (deleted === 0) {
        return res.status(404).json({ message: 'Permiso no encontrado.' });
      }

      res.status(200).json({ message: 'Permiso eliminado correctamente.' });
    } catch (error) {
      console.error('Error en delete controller:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const result = await ModuleRoleModel.findById(id);

      if (!result || result.length === 0) {
        return res.status(404).json({ message: 'Permiso no encontrado.' });
      }

      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error en findById controller:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
}

export default ModuleRoleController;