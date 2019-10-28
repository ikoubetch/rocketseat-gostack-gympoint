import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { enrollment } = data;

    await Mail.sendMail({
      to: `${enrollment.student.name} <${enrollment.student.email}>`,
      subject: 'Nova matricula',
      template: 'newenrollment',
      context: {
        student: enrollment.student.name,
        plan: enrollment.plan.title,
        date: format(parseISO(enrollment.end_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
      },
    });
  }
}

export default new EnrollmentMail();
