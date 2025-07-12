import { connect } from '../config/db/connectMysql.js';

class ModuleRoleModel {
  
  static async create({ module_fk, role_user_fk, can_view = 1, can_create = 0, can_edit = 0, can_delete = 0 }) {
    try {
      const [result] = await connect.query(
        'INSERT INTO Module_role (module_fk, role_user_fk, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [module_fk, role_user_fk, can_view, can_create, can_edit, can_delete]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error en create moduleRole:', error);
      return 0;
    }
  }

  static async show() {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM Module_role ORDER BY id'
      );
      return rows;
    } catch (error) {
      console.error('Error en show moduleRole:', error);
      return [0];
    }
  }

  static async update(id, { module_fk, role_user_fk, can_view, can_create, can_edit, can_delete }) {
    try {
      const [result] = await connect.query(
        'UPDATE Module_role SET module_fk = ?, role_user_fk = ?, can_view = ?, can_create = ?, can_edit = ?, can_delete = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [module_fk, role_user_fk, can_view, can_create, can_edit, can_delete, id]
      );
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error en update moduleRole:', error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const [result] = await connect.query(
        'DELETE FROM Module_role WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error en delete moduleRole:', error);
      return null;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM Module_role WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en findById moduleRole:', error);
      return null;
    }
  }

  static async findByIdWithDetails(id) {
    try {
      const [rows] = await connect.query(`
        SELECT 
          mr.id,
          mr.module_fk,
          m.name as module_name,
          mr.role_user_fk,
          ur.user_id,
          u.username as user_name,
          r.name as role_name,
          mr.can_view,
          mr.can_create,
          mr.can_edit,
          mr.can_delete,
          mr.created_at,
          mr.updated_at
        FROM Module_role mr
        INNER JOIN Module m ON mr.module_fk = m.id
        INNER JOIN User_role ur ON mr.role_user_fk = ur.id
        INNER JOIN User u ON ur.user_id = u.id
        INNER JOIN Role r ON ur.role_id = r.id
        WHERE mr.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error en findByIdWithDetails moduleRole:', error);
      return null;
    }
  }

  static async findByModuleAndRole(module_fk, role_user_fk) {
    try {
      const [rows] = await connect.query(
        'SELECT * FROM Module_role WHERE module_fk = ? AND role_user_fk = ?',
        [module_fk, role_user_fk]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en findByModuleAndRole moduleRole:', error);
      return null;
    }
  }

  static async showWithDetails() {
    try {
      const [rows] = await connect.query(`
        SELECT 
          mr.id,
          mr.module_fk,
          m.name as module_name,
          mr.role_user_fk,
          ur.user_id,
          u.username as user_name,
          r.name as role_name,
          mr.can_view,
          mr.can_create,
          mr.can_edit,
          mr.can_delete,
          mr.created_at,
          mr.updated_at
        FROM Module_role mr
        INNER JOIN Module m ON mr.module_fk = m.id
        INNER JOIN User_role ur ON mr.role_user_fk = ur.id
        INNER JOIN User u ON ur.user_id = u.id
        INNER JOIN Role r ON ur.role_id = r.id
        ORDER BY mr.id
      `);
      return rows;
    } catch (error) {
      console.error('Error en showWithDetails moduleRole:', error);
      return [0];
    }
  }
}

export default ModuleRoleModel;