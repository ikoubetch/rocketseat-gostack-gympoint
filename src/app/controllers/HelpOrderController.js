import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const helpOrder = await HelpOrder.findByPk(id, {
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

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order does not exists.' });
    }

    if (helpOrder.answer_at) {
      return res
        .status(400)
        .json({ error: 'Help order was already answered.' });
    }

    await helpOrder.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    return res.json(helpOrder);
  }

  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: {
        answer_at: null,
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
