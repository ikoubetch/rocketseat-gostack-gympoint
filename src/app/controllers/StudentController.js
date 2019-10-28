import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      document_number: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const documentNumber = req.body.document_number;

    const studentExists = await Student.findOne({
      where: { document_number: documentNumber },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student aleardy exists.' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );
    return res.json({
      id,
      name,
      document_number: documentNumber,
      email,
      age,
      weight,
      height,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      document_number: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const {
      name,
      document_number: documentNumber,
      email,
      age,
      weight,
      height,
    } = await student.update(req.body);

    return res.json({
      id,
      name,
      document_number: documentNumber,
      email,
      age,
      weight,
      height,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    await student.destroy();

    const students = await Student.findAll();
    return res.json(students);
  }

  async index(req, res) {
    const students = await Student.findAll();
    return res.json(students);
  }

  async show(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    return res.json(student);
  }
}

export default new StudentController();
