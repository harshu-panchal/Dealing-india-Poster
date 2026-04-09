import express from 'express';
import { registerUser, getUsers } from '../controller/userController.js';

const router = express.Router();

router.route('/').post(registerUser).get(getUsers);

export default router;
