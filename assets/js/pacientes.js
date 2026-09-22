document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'restaurafisio_pacientes';
  const form = document.querySelector('#patient-form');
  const fields = {
    name: document.querySelector('#patient-name'),
    cpf: document.querySelector('#patient-cpf'),
    birthDate: document.querySelector('#patient-birth-date'),
    phone: document.querySelector('#patient-phone')
  };
  const search = document.querySelector('#patient-search');
  const count = document.querySelector('#patient-count');
  const emptyState = document.querySelector('#empty-state');
  const emptyStateTitle = document.querySelector('#empty-state-title');
  const emptyStateMessage = document.querySelector('#empty-state-message');
  const list = document.querySelector('#patient-list-items');
  const feedback = document.querySelector('#form-feedback');
  const formPanel = document.querySelector('#patient-form-panel');
  const formModeLabel = document.querySelector('#form-mode-label');
  const formTitle = document.querySelector('#form-title');
  const submitButton = document.querySelector('#form-submit');
  let editingId = null;
  let patients = loadPatients();

  function loadPatients() {
    try {
      const storedPatients = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(storedPatients) ? storedPatients : [];
    } catch (error) {
      return [];
    }
  }

  const savePatients = () => {
    localStorage.setItem(storageKey, JSON.stringify(patients));
  };

  const formatBirthDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const showFeedback = (message, type) => {
    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
  };

  const normalize = (value) => value.toLocaleLowerCase('pt-BR').trim();

  const getFilteredPatients = () => {
    const query = normalize(search.value);
    return patients.filter((patient) => {
      return normalize(patient.name).includes(query) || normalize(patient.cpf).includes(query);
    });
  };

  const renderPatients = () => {
    const filteredPatients = getFilteredPatients();
    const patientLabel = patients.length === 1 ? 'paciente' : 'pacientes';
    count.textContent = `${patients.length} ${patientLabel}`;
    emptyState.hidden = filteredPatients.length > 0;
    list.innerHTML = '';

    if (patients.length === 0) {
      emptyStateTitle.textContent = 'Nenhum paciente cadastrado';
      emptyStateMessage.textContent = 'Os pacientes cadastrados aparecerão nesta área.';
    } else if (filteredPatients.length === 0) {
      emptyStateTitle.textContent = 'Paciente não encontrado';
      emptyStateMessage.textContent = 'Nenhum paciente corresponde à busca informada.';
    }

    filteredPatients.forEach((patient) => {
      const card = document.createElement('article');
      card.className = 'patient-card';

      const name = document.createElement('h3');
      name.textContent = patient.name;

      const details = document.createElement('div');
      details.className = 'patient-card-details';
      const data = [
        ['CPF', patient.cpf],
        ['Data de nascimento', formatBirthDate(patient.birthDate)],
        ['Telefone/WhatsApp', patient.phone]
      ];

      data.forEach(([label, value]) => {
        const detail = document.createElement('div');
        detail.className = 'patient-card-detail';
        const term = document.createElement('span');
        term.className = 'patient-card-label';
        term.textContent = label;
        const description = document.createElement('span');
        description.className = 'patient-card-value';
        description.textContent = value;
        detail.append(term, description);
        details.append(detail);
      });

      const actions = document.createElement('div');
      actions.className = 'patient-card-actions';
      actions.innerHTML = `<button class="card-action edit-action" type="button" data-action="edit" data-id="${patient.id}">Editar</button><button class="card-action delete-action" type="button" data-action="delete" data-id="${patient.id}">Excluir</button>`;

      card.append(name, details, actions);
      list.append(card);
    });
  };

  const resetFormMode = () => {
    editingId = null;
    formPanel.classList.remove('is-editing');
    formModeLabel.textContent = 'Cadastro inicial';
    formTitle.textContent = 'Dados do paciente';
    submitButton.textContent = 'Cadastrar paciente';
  };

  const startEditing = (patient) => {
    editingId = patient.id;
    fields.name.value = patient.name;
    fields.cpf.value = patient.cpf;
    fields.birthDate.value = patient.birthDate;
    fields.phone.value = patient.phone;
    formPanel.classList.add('is-editing');
    formModeLabel.textContent = 'Modo de edição';
    formTitle.textContent = 'Editar paciente';
    submitButton.textContent = 'Salvar alterações';
    document.querySelector('.new-patient').open = true;
    fields.name.focus();
  };

  const clearValidation = () => {
    Object.values(fields).forEach((field) => {
      field.classList.remove('input-error');
      field.removeAttribute('aria-invalid');
    });
  };

  search.addEventListener('input', renderPatients);

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

    const patientData = {
      name: fields.name.value.trim(),
      cpf: fields.cpf.value.trim(),
      birthDate: fields.birthDate.value,
      phone: fields.phone.value.trim()
    };

    if (editingId) {
      const patient = patients.find((item) => item.id === editingId);
      Object.assign(patient, patientData);
      showFeedback('Paciente atualizado com sucesso.', 'success');
    } else {
      patients.push({ id: `${Date.now()}-${Math.random()}`, ...patientData });
      showFeedback('Paciente cadastrado com sucesso.', 'success');
    }

    savePatients();
    renderPatients();
    form.reset();
    clearValidation();
    resetFormMode();
  });

  list.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;

    const patient = patients.find((item) => item.id === actionButton.dataset.id);
    if (!patient) return;

    if (actionButton.dataset.action === 'edit') {
      startEditing(patient);
      return;
    }

    patients = patients.filter((item) => item.id !== patient.id);
    savePatients();
    renderPatients();
    showFeedback('Paciente excluído com sucesso.', 'success');
  });

  renderPatients();
});
