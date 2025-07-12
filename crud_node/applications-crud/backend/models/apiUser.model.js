import { connect } from '../config/db/connectMysql.js';

class ApiUserModel {

  static async create({ username, email, passwordHash, statusId }) {
    const [result] = await connect.query(
      'INSERT INTO ApiUser (username, email, password_hash, status_id) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, statusId]
    );
    return result.insertId;
  }

  static async show() {
    const [rows] = await connect.query(
      'SELECT * FROM ApiUser ORDER BY id'
    );
    return rows;
  }

  static async showActive() {
    const [rows] = await connect.query(
      'CALL sp_show_apiuser_active()'
    );
    return rows[0];
  }

  static async update(id, { username, email, passwordHash, status_id }) {
    const [result] = await connect.query(
      'UPDATE ApiUser SET username = ?, email = ?, password_hash = ?, status_id = ?, updated_at =CURRENT_TIMESTAMP WHERE id = ?',
      [username, email, passwordHash, status_id, id]
    );
    if (result.affectedRows > 0) {
      const updatedUser = await this.findById(id);
      return {
        success: true,
        data: updatedUser
      };
    }
    return {
      success: false,
      data: null
    };
  }

  static async delete(id) {
    const [result] = await connect.query(
      'DELETE FROM ApiUser WHERE id=?',
      [id]
    );
    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows
    };
  }

  static async findById(id) {
    const [rows] = await connect.query(
      'SELECT * FROM ApiUser WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByIdActive(id) {
    const [rows] = await connect.query(
      'CALL sp_show_id_apiuser_active(?)',
      [id]
    );
    return rows[0][0];
  }

  static async findByName(username) {
    const [rows] = await connect.query(
      'SELECT * FROM ApiUser WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async updateLogin(id) {
    const [result] = await connect.query(
      'UPDATE ApiUser SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return {
      success: result.affectedRows > 0
    };
  }

}
export default ApiUserModel;