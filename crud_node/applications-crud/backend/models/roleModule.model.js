import { connect } from '../config/db/connectMysql.js';

class ModuleRoleModel {
  
  static async create({ module_fk, role_user_fk, can_view = 1, can_create = 0, can_edit = 0, can_delete = 0 }) {
    try {
      const sqlQuery = `
        INSERT INTO Module_role (module_fk, role_user_fk, can_view, can_create, can_edit, can_delete) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connect.query(sqlQuery, [module_fk, role_user_fk, can_view, can_create, can_edit, can_delete]);
      return result.insertId;
    } catch (error) {
      console.error('Error en create:', error);
      return [0];
    }
  }

  static async show() {
    try {
      const sqlQuery = "SELECT * FROM Module_role ORDER BY id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error en show:', error);
      return [0];
    }
  }

  static async update(id, { can_view, can_create, can_edit, can_delete }) {
    try {
      const sqlQuery = `
        UPDATE Module_role 
        SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const [result] = await connect.query(sqlQuery, [can_view, can_create, can_edit, can_delete, id]);
      return result.affectedRows || [0];
    } catch (error) {
      console.error('Error en update:', error);
      return [0];
    }
  }

  static async delete(id) {
    try {
      const sqlQuery = "DELETE FROM Module_role WHERE id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows || [0];
    } catch (error) {
      console.error('Error en delete:', error);
      return [0];
    }
  }

  static async findById(id) {
    try {
      const sqlQuery = "SELECT * FROM Module_role WHERE id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result;
    } catch (error) {
      console.error('Error en findById:', error);
      return [0];
    }
  }
}

export default ModuleRoleModel;