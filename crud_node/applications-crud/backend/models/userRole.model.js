import { connect } from '../config/db/connectMysql.js';

class UserRoleModel {

  static async create({ user_id, role_id, status_id }) {
    const [result] = await connect.query(
      'INSERT INTO User_role (user_id, role_id, status_id) VALUES (?, ?, ?)',
      [user_id, role_id, status_id]
    );
    return result.insertId;
  }

  static async show() {
    const [rows] = await connect.query(
      'SELECT * FROM User_role ORDER BY id'
    );
    return rows[0];
  }
 

  static async update(id, { user_id, role_id, status_id  }) {
    const [result] = await connect.query(
      'UPDATE User_role SET user_id = ?, role_id = ?, status_id=?,updated_at =CURRENT_TIMESTAMP WHERE id = ?',
      [user_id, role_id, status_id,id ]
    );
    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async delete(id) {
    const [result] = await connect.query(
      'DELETE FROM User_role WHERE id=?',
      [id]
    );
    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  static async findById(id) {
    const [rows] = await connect.query(
      'SELECT * FROM User_role WHERE id = ?',
      [id]
    );
    return rows[0];
  }

   static async showRoleUser(id) {
     const [rows] = await connect.query(
      'CALL sp_user_role_id(?)',
      [id]
    );
    return rows[0];
  }

  static async showAllUserRoles() {
    const [rows] = await connect.query(`
      SELECT 
        ur.id,
        ur.user_id,
        u.username as user_name,
        ur.role_id,
        r.name as role_name,
        ur.status_id,
        us.name as status_name
      FROM User_role ur
      INNER JOIN User u ON ur.user_id = u.id
      INNER JOIN Role r ON ur.role_id = r.id
      INNER JOIN User_status us ON ur.status_id = us.id
      WHERE ur.status_id = 1
      ORDER BY ur.id
    `);
    return rows;
  }

}
export default UserRoleModel;