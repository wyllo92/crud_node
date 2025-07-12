import ModuleRoleModel from '../models/moduleRole.model.js';

class ModuleRoleController {
  
  async create(req, res) {
    try {
      const { module_fk, role_user_fk, can_view, can_create, can_edit, can_delete } = req.body;
      
      // Basic validation
      if (!module_fk || !role_user_fk) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Check if permission already exists
      const existingPermission = await ModuleRoleModel.findByModuleAndRole(module_fk, role_user_fk);
      if (existingPermission) {
        return res.status(409).json({ 
          error: 'Ya existe un permiso para esta combinación de módulo y rol de usuario.' 
        });
      }

      const insertId = await ModuleRoleModel.create({ module_fk, role_user_fk, can_view, can_create, can_edit, can_delete });

      if (insertId === 0) {
        return res.status(400).json({ error: 'Error al crear el permiso del módulo.' });
      }

      res.status(201).json({
        message: 'Permiso del módulo creado correctamente.',
        id: insertId
      });
    } catch (error) {
      console.error('Error en create controller:', error);
      
      // Handle duplicate key error specifically
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          error: 'Ya existe un permiso para esta combinación de módulo y rol de usuario.' 
        });
      }
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const roles = await ModuleRoleModel.showWithDetails();

      if (!roles || roles.length === 0) {
        return res.status(404).json({ error: 'No se encontraron permisos.' });
      }

      res.status(200).json({
        message: 'Permisos obtenidos correctamente',
        data: roles
      });
    } catch (error) {
      console.error('Error en show controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { module_fk, role_user_fk, can_view, can_create, can_edit, can_delete } = req.body;

      // Basic validation
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify if the permission exists
      const existingPermission = await ModuleRoleModel.findById(id);
      if (!existingPermission) {
        return res.status(404).json({ error: 'Permiso no encontrado.' });
      }

      // Check if the new combination already exists (if module_fk or role_user_fk are being changed)
      if ((module_fk && module_fk !== existingPermission.module_fk) || 
          (role_user_fk && role_user_fk !== existingPermission.role_user_fk)) {
        const newModuleFk = module_fk || existingPermission.module_fk;
        const newRoleUserFk = role_user_fk || existingPermission.role_user_fk;
        
        const existingPermissionWithNewCombination = await ModuleRoleModel.findByModuleAndRole(newModuleFk, newRoleUserFk);
        if (existingPermissionWithNewCombination && existingPermissionWithNewCombination.id !== parseInt(id)) {
          return res.status(409).json({ 
            error: 'Ya existe un permiso para esta combinación de módulo y rol de usuario.' 
          });
        }
      }

      const updated = await ModuleRoleModel.update(id, { 
        module_fk: module_fk || existingPermission.module_fk,
        role_user_fk: role_user_fk || existingPermission.role_user_fk,
        can_view, 
        can_create, 
        can_edit, 
        can_delete 
      });

      if (updated === 0) {
        return res.status(400).json({ error: 'Error al actualizar el permiso.' });
      }

      res.status(200).json({
        message: 'Permiso actualizado correctamente.',
        data: updated
      });
    } catch (error) {
      console.error('Error en update controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      // Basic validation
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify if the permission exists
      const existingPermission = await ModuleRoleModel.findById(id);
      if (!existingPermission || existingPermission.length === 0) {
        return res.status(404).json({ error: 'Permiso no encontrado.' });
      }

      const deleted = await ModuleRoleModel.delete(id);

      if (deleted === 0) {
        return res.status(400).json({ error: 'Error al eliminar el permiso.' });
      }

      res.status(200).json({
        message: 'Permiso eliminado correctamente.',
        data: deleted
      });
    } catch (error) {
      console.error('Error en delete controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;

      // Basic validation
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const result = await ModuleRoleModel.findByIdWithDetails(id);

      if (!result) {
        return res.status(404).json({ error: 'Permiso no encontrado.' });
      }

      res.status(200).json({
        message: 'Permiso obtenido correctamente',
        data: result
      });
    } catch (error) {
      console.error('Error en findById controller:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ModuleRoleController();