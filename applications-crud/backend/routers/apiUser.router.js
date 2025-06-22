import { Router } from "express";
import ApiUserController from "../controllers/apiUser.controller.js";
const router = Router();
const name = "/apiuser";
const nameLogin = "/login";

//Login route
router.route(nameLogin).post(ApiUserController.login);

// Public route
router
  .route(name)
  .post(ApiUserController.register) 
  .get(ApiUserController.show); 

router
  .route(`${name}/:id`)
  .get(ApiUserController.findById) 
  .put(ApiUserController.update) 
  .delete(ApiUserController.delete);

export default router;
