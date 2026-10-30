document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#evolution-form');
  const patientSelect = document.querySelector('#patient');
  const feedback = document.querySelector('#form-feedback');
  const dateInput = document.querySelector('#date');

  // Carregar pacientes cadastrados na Sprint 01
  function loadPatients() {
    try {
      const patients = JSON.parse(
        localStorage.getItem('restaurafisio_pacientes')
      );

      return Array.isArray(patients) ? patients : [];
    } catch (error) {
      return [];
    }
  }

  // Preencher a lista de pacientes
  function renderPatients() {
    const patients = loadPatients();

    patients.forEach((patient) => {
      const option = document.createElement('option');

      option.value = patient.id;
      option.textContent = patient.name;

      patientSelect.appendChild(option);
    });

    if (patients.length === 0) {
      feedback.textContent = 'Nenhum paciente cadastrado.';
      feedback.className = 'form-feedback error';
    }
  }

  // Preencher a data atual
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().split('T')[0];

  dateInput.value = localDate;

  // Validar formulário
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const requiredFields = form.querySelectorAll('[required]');

    const invalidField = Array.from(requiredFields).find(
      (field) => !field.value.trim()
    );

    if (invalidField) {
      feedback.textContent = 'Preencha todos os campos obrigatórios.';
      feedback.className = 'form-feedback error';
      invalidField.focus();
      return;
    }

    // A integração com a API será feita no Card 03.
    feedback.textContent =
      'Formulário validado! O registro no banco de dados será implementado na próxima etapa.';

    feedback.className = 'form-feedback success';
  });

  renderPatients();
});