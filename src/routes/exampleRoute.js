import express from 'express';
import * as exampleController from '../controllers/exampleController.js';
import { validateExample } from '../middlewares/exampleValidator.js';
import { middlewareMethod } from '../middlewares/dummyMiddelware.js';
const router = express.Router();

// Define routes
router.get('/v1/examples', exampleController.getAllExamples);
router.post('/v1/examples',middlewareMethod,validateExample, exampleController.createExample);
router.get('/v1/examples/:id', exampleController.getExampleById);
router.put(
  '/v1/examples/:id',
  validateExample,
  exampleController.updateExample
);
router.delete('/v1/examples/:id', exampleController.deleteExample);

export default router;
