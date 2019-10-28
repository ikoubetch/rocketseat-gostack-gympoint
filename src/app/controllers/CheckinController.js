import { Op } from 'sequelize';
import { startOfDay, subDays } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const { studentId } = req.params;
    const student = await Student.findByPk(studentId, {
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

    const today = startOfDay(new Date());

    const CheckinExists = await Checkin.findOne({
      where: {
        student_id: studentId,
        created_at: {
          [Op.gte]: today,
        },
      },
    });

    if (CheckinExists) {
      return res
        .status(400)
        .json({ error: 'You already made the checkin today.' });
    }

    const minDate = subDays(today, 7);

    const countCheckins = await Checkin.findAll({
      where: {
        student_id: studentId,
        created_at: {
          [Op.gte]: minDate,
        },
      },
    });

    if (countCheckins && countCheckins.length >= 5) {
      return res.status(400).json({
        error: 'You can only do 5 checkins within 7 days.',
      });
    }

    const { id } = await Checkin.create({
      student_id: studentId,
    });

    return res.json({
      id,
      student_id: studentId,
      student,
    });
  }

  async index(req, res) {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }
    const checkin = await Checkin.findAll({
      where: {
        student_id: studentId,
      },
      attributes: ['id', 'student_id', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: [
            'name',
            'document_number',
            'email',
            'age',
            'weight',
            'height',
          ],
        },
      ],
    });
    return res.json(checkin);
  }
}

export default new CheckinController();
