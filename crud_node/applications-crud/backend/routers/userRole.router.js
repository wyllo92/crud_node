import { Router } from "express";
import UserRoleController from '../controllers/userRole.controller.js';
const router = Router();
const name = '/userRole';
const nameUserRole = '/userIdRole';

// Public route
router.route(name)
  .post(UserRoleController.register) // Register a new user
  .get(UserRoleController.show);// Show all users

router.route(`${name}/:id`)
  .get(UserRoleController.findById)// Show a user by ID
  .put(UserRoleController.update)// Update a user by ID
  .delete(UserRoleController.delete);// Delete a user by ID

  //Login route
  router.route(`${nameUserRole}/:id`)
    .get(UserRoleController.showRoleUser);// Show user roles by user ID

  // Get all user roles with details
  router.route(nameUserRole)
    .get(UserRoleController.showAllUserRoles);// Show all user roles with details

export default router;