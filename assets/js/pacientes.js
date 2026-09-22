document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#patient-form');
  const fields = {
    name: document.querySelector('#patient-name'),
    cpf: document.querySelector('#patient-cpf'),
    birthDate: document.querySelector('#patient-birth-date'),
    phone: document.querySelector('#patient-phone')
  };
  const count = document.querySelector('#patient-count');
  const emptyState = document.querySelector('#empty-state');
  const list = document.querySelector('#patient-list-items');
  const feedback = document.querySelector('#form-feedback');
  const patients = [];

  const formatBirthDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const showFeedback = (message, type) => {
    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
  };

  const renderPatients = () => {
    const patientLabel = patients.length === 1 ? 'paciente' : 'pacientes';
    count.textContent = `${patients.length} ${patientLabel}`;
    emptyState.hidden = patients.length > 0;
    list.innerHTML = '';

    patients.forEach((patient) => {
      const card = document.createElement('article');
      card.className = 'patient-card';

      const name = document.createElement('h3');
      name.textContent = patient.name;

      const details = document.createElement('dl');
      const data = [
        ['CPF', patient.cpf],
        ['Nascimento', formatBirthDate(patient.birthDate)],
        ['Telefone/WhatsApp', patient.phone]
      ];

      data.forEach(([label, value]) => {
        const term = document.createElement('dt');
        term.textContent = label;
        const description = document.createElement('dd');
        description.textContent = value;
        details.append(term, description);
      });

      card.append(name, details);
      list.append(card);
    });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const requiredFields = Object.values(fields);
    const emptyField = requiredFields.find((field) => !field.value.trim());

    requiredFields.forEach((field) => {
      field.classList.toggle('input-error', !field.value.trim());
      field.removeAttribute('aria-invalid');
    });

    if (emptyField) {
      emptyField.setAttribute('aria-invalid', 'true');
      showFeedback('Preencha todos os campos obrigatórios.', 'error');
      emptyField.focus();
      return;
    }

    patients.push({
      name: fields.name.value.trim(),
      cpf: fields.cpf.value.trim(),
      birthDate: fields.birthDate.value,
      phone: fields.phone.value.trim()
    });

    renderPatients();
    form.reset();
    requiredFields.forEach((field) => {
      field.classList.remove('input-error');
      field.removeAttribute('aria-invalid');
    });
    showFeedback('Paciente cadastrado com sucesso.', 'success');
  });
});
