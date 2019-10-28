import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import QuestionController from './app/controllers/QuestionController';
import HelpOrderController from './app/controllers/HelpOrderController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.post('/students/:studentId/checkins', CheckinController.store);
routes.get('/students/:studentId/checkins', CheckinController.index);

routes.post('/students/:studentId/help-orders', QuestionController.store);
routes.get('/students/:studentId/help-orders', QuestionController.index);

routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', StudentController.delete);
routes.get('/students', StudentController.index);
routes.get('/students/:id', StudentController.show);

routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);
routes.get('/plans/', PlanController.index);
routes.get('/plans/:id', PlanController.show);

routes.post('/enrollment', EnrollmentController.store);
routes.put('/enrollment/:id', EnrollmentController.update);
routes.delete('/enrollment/:id', EnrollmentController.delete);
routes.get('/enrollment/', EnrollmentController.index);
routes.get('/enrollment/:id', EnrollmentController.show);

routes.get('/help-orders/', HelpOrderController.index);
routes.post('/help-orders/:id/answer', HelpOrderController.update);

export default routes;
