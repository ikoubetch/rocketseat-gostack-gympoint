import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, addMonths, isBefore, parseISO } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

import EnrollmentJob from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const enrollment = req.body;

    const student = await Student.findByPk(enrollment.student_id, {
      attributes: [
        'name',
        'document_number',
        'email',
        'age',
        'weight',
        'height',
      ],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const plan = await Plan.findByPk(enrollment.plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    const today = startOfDay(new Date());

    const EnrollmentExists = await Enrollment.findOne({
      where: {
        student_id: enrollment.student_id,
        start_date: {
          [Op.lte]: today,
        },
        end_date: {
          [Op.gte]: today,
        },
      },
    });

    if (EnrollmentExists) {
      return res.status(400).json({ error: 'Enrollment aleardy exists.' });
    }

    enrollment.price = plan.price * plan.duration;
    enrollment.start_date = enrollment.start_date
      ? parseISO(enrollment.start_date)
      : today;
    enrollment.end_date = addMonths(today, plan.duration);

    enrollment.student = student;
    enrollment.plan = plan;

    await Enrollment.create(enrollment);

    await Queue.add(EnrollmentJob.key, { enrollment });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exists.' });
    }

    const newEnrollment = req.body;

    newEnrollment.student_id = newEnrollment.student_id
      ? newEnrollment.student_id
      : enrollment.student_id;

    const student = await Student.findByPk(newEnrollment.student_id, {
      attributes: [
        'name',
        'document_number',
        'email',
        'age',
        'weight',
        'height',
      ],
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    newEnrollment.plan_id = newEnrollment.plan_id
      ? newEnrollment.plan_id
      : enrollment.plan_id;

    const plan = await Plan.findByPk(newEnrollment.plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    const startDate = newEnrollment.start_date
      ? startOfDay(parseISO(newEnrollment.start_date))
      : enrollment.start_date;

    newEnrollment.price = plan.price * plan.duration;
    newEnrollment.start_date = startDate;
    newEnrollment.end_date = addMonths(startDate, plan.duration);

    if (isBefore(newEnrollment.end_date, startOfDay(new Date()))) {
      return res
        .status(400)
        .json({ error: 'End date is less than current date.' });
    }

    await enrollment.update(newEnrollment);

    return res.json(newEnrollment);
  }

  async delete(req, res) {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exists.' });
    }

    await enrollment.destroy();

    const enrollments = await Enrollment.findAll();
    return res.json(enrollments);
  }

  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'document_number', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration', 'price'],
        },
      ],
    });
    return res.json(enrollments);
  }

  async show(req, res) {
    const { id } = req.params;

    const enrollments = await Enrollment.findByPk(id, {
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'document_number', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration', 'price'],
        },
      ],
    });

    if (!enrollments) {
      return res.status(400).json({ error: 'Enrollment does not exists.' });
    }

    return res.json(enrollments);
  }
}

export default new EnrollmentController();
