import ApiUserModel from '../models/apiUser.model.js';
import { encryptPassword, comparePassword } from '../library/appBcrypt.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
class ApiUserController {

  async register(req, res) {
    try {
      const { username, email, password_hash, status_id} = req.body;
      // Basic validation
      if (!username || !email || !password_hash || !status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Additional validation
      if (password_hash.length < 8) {
        return res.status(400).json({
          error: 'The password must be at least 8 characters long.'
        });
      }
      // Verify if the User already exists
      const existingUser = await ApiUserModel.findByName(username);
      if (existingUser) {
        return res.status(409).json({
          error: 'The username is already in use'
        });
      }
      const passwordHash = await encryptPassword(password_hash);
      const userId = await ApiUserModel.create({
        username,
        email,
        passwordHash,
        statusId: status_id
      });
      res.status(201).json({
        message: 'User created successfully',
        id: userId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const users = await ApiUserModel.showActive();
      if (!users || users.length === 0) {
        return res.status(404).json({ error: 'No users found' });
      }
      res.status(200).json({
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      console.error('Error in show:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
         const { username, email, password_hash, status_id} = req.body;
         const id = req.params.id;
      // Basic validation
      if (!username || !email || !password_hash || !status_id|| !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Additional validation
      if (password_hash.length < 8) {
        return res.status(400).json({
          error: 'The password must be at least 8 characters long.'
        });
      }
      // Verify if the User exists  
      const existingUser = await ApiUserModel.findByIdActive(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }   

      const passwordHash = await encryptPassword(password_hash);
      const updateResult = await ApiUserModel.update(id, { username, email, passwordHash, status_id});
      if (updateResult.success) {
        res.status(200).json({
          message: 'User updated successfully',
          data: updateResult.data
        });
      } else {
        res.status(500).json({ error: 'Failed to update user' });
      }
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
      // Verify if the User exists
      const existingUser = await ApiUserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const deleteResult = await ApiUserModel.delete(id);
      if (deleteResult.success) {
        res.status(200).json({
          message: 'User deleted successfully'
        });
      } else {
        res.status(500).json({ error: 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
      // Get user by ID
      const existingUserModel = await ApiUserModel.findByIdActive(id);
      if (!existingUserModel) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({
        message: 'User retrieved successfully',
        data: existingUserModel
      });
    } catch (error) {
      console.error('Error in findById:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async login(req, res) {
    try {
      const { user, password } = req.body;
      // Basic validate
      if (!user || !password) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Check if the user exists
      const existingUser = await ApiUserModel.findByName(user);
      if (existingUser) {
        const passwordHash = await comparePassword(password, existingUser.password_hash);
        if (!passwordHash) {
          return res.status(401).json({ error: 'Invalid password' });
        } else {
          const updateLogin = await ApiUserModel.updateLogin(existingUser.id);
          if (!updateLogin) {
            return res.status(500).json({ error: 'Failed to update login time' });
          }
          const token = jwt.sign({ id: existingUser.id, email: existingUser.email, status: existingUser.status_id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
            algorithm: "HS256"
          });
          res.status(200).json({
            message: 'Login successful',
            user: {
              id: existingUser.id,
              username: existingUser.username,
              email: existingUser.email,
              statusId: existingUser.status_id,
              token: token
            }
          });
        }
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ApiUserController();