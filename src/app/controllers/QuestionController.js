import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

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

    const { id, question } = await HelpOrder.create({
      question: req.body.question,
      student_id: studentId,
    });

    return res.json({
      id,
      student_id: studentId,
      student,
      question,
    });
  }

  async index(req, res) {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }
    const helpOrders = await HelpOrder.findAll({
      where: {
        student_id: studentId,
      },
      attributes: ['id', 'student_id', 'question', 'answer', 'answer_at'],
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
    return res.json(helpOrders);
  }
}

export default new HelpOrderController();
