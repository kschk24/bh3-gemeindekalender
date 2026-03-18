import { Response, NextFunction } from 'express';
import { EventsService } from '../services/events.service';
import { AuthRequest } from '../middleware/auth';
import { CreateEventInput, UpdateEventInput, EventFiltersInput, RegistrationInput } from '../validators/events.validators';

const eventsService = new EventsService();

export class EventsController {
  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters: EventFiltersInput = req.query as unknown as EventFiltersInput;
      const result = await eventsService.getAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const event = await eventsService.getById(id);
      res.json(event);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: CreateEventInput = req.body;
      const userId = req.user!.id;
      const event = await eventsService.create(data, userId);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: UpdateEventInput = req.body;
      const event = await eventsService.update(id, data, req.user);
      res.json(event);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await eventsService.delete(id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: RegistrationInput = req.body;
      const userId = req.user?.id;
      const registration = await eventsService.registerForEvent(id, userId, data);
      res.status(201).json(registration);
    } catch (error) {
      next(error);
    }
  };

  getRegistrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const registrations = await eventsService.getRegistrations(id);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  };
}
