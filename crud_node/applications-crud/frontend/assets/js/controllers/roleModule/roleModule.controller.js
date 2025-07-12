document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
  await checkAuth();
  console.log('ModuleRole controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('moduleRoleForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const myForm = objForm.getForm();
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

// Variables para mapear IDs a nombres
let modulesMap = {};
let rolesMap = {};

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) return;

  toggleLoading(true);
  documentData = objForm.getDataForm();

  // Convertir checkboxes no seleccionados a 0
  ['can_view', 'can_create', 'can_edit', 'can_delete'].forEach(field => {
    documentData[field] = document.getElementById(field).checked ? 1 : 0;
  });

  if (insertUpdate) {
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_MODULE_ROLE;
  } else {
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_MODULE_ROLE + keyId;
  }

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(res => res.json())
    .then(data => {
      console.log('Response:', data);
      if (data.message) {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    })
    .finally(() => {
      loadView();
      showHiddenModal(false);
    });
});

function add() {
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  showHiddenModal(true);
}

function edit(id) {
  insertUpdate = false;
  keyId = id;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  getDataId(id);
}

function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id);
}

function delete_(id) {
  if (confirm("¿Estás seguro de eliminar este permiso?")) {
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_MODULE_ROLE + id;
    getDataServices("", httpMethod, endpointUrl)
      .then(res => res.json())
      .then(data => {
        console.log('Delete response:', data);
        if (data.message) {
          alert(data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar');
      })
      .finally(() => {
        loadView();
      });
  }
}

function getDataId(id) {
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_MODULE_ROLE + id;
  getDataServices("", httpMethod, endpointUrl)
    .then(res => res.json())
    .then(data => {
      console.log('Data by ID:', data);
      if (data && data.length > 0) {
        let item = data[0];
        objForm.setDataFormJson(item);

        // Set checkboxes manually
        ['can_view', 'can_create', 'can_edit', 'can_delete'].forEach(field => {
          document.getElementById(field).checked = item[field] == 1;
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al obtener datos');
    })
    .finally(() => {
      showHiddenModal(true);
    });
}

function getData() {
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_MODULE_ROLE;
  getDataServices("", httpMethod, endpointUrl)
    .then(res => res.json())
    .then(data => {
      console.log('Response from moduleRole:', data);
      createTable(data);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al cargar datos');
    })
    .finally(() => {
      new DataTable(appTable);
      toggleLoading(false);
    });
}

function createTable(response) {
  const rows = Array.isArray(response) ? response : (response.data || []);
  if (!rows || rows.length === 0) {
    console.warn('No rows to display:', rows);
    objTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay datos disponibles</td></tr>';
    return;
  }
  
  objTableBody.innerHTML = '';
  rows.forEach(row => {
    let moduleName = modulesMap[row.module_fk] || `Módulo #${row.module_fk}`;
    let roleName = rolesMap[row.role_user_fk] || `Rol #${row.role_user_fk}`;

    let tr = `<tr>
      <td>${row.id}</td>
      <td>${moduleName}</td>
      <td>${roleName}</td>
      <td><input type="checkbox" disabled ${row.can_view ? "checked" : ""}></td>
      <td><input type="checkbox" disabled ${row.can_create ? "checked" : ""}></td>
      <td><input type="checkbox" disabled ${row.can_edit ? "checked" : ""}></td>
      <td><input type="checkbox" disabled ${row.can_delete ? "checked" : ""}></td>
      <td>
        <button class="btn btn-success" onclick="showId(${row.id})"><i class="fas fa-eye"></i></button>
        <button class="btn btn-primary" onclick="edit(${row.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger" onclick="delete_(${row.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
    objTableBody.innerHTML += tr;
  });
}

function showHiddenModal(show) {
  show ? objModal.show() : objModal.hide();
}

function loadView() {
  getData();
  loadSelects();
  loadRoles();
  toggleLoading(true);
}

function loadSelects() {
  fetch(URL_MODULE)
    .then(res => res.json())
    .then(data => {
      console.log('Modules data:', data);
      const modules = Array.isArray(data) ? data : (data.data || []);
      fillSelect('module_fk', modules, 'id', 'name');
      modulesMap = Object.fromEntries(modules.map(item => [item.id, item.name]));
    })
    .catch(error => {
      console.error('Error loading modules:', error);
    });
}

function loadRoles() {
  fetch(URL_USER_ROLE)
    .then(res => res.json())
    .then(data => {
      console.log('Roles data:', data);
      const roles = Array.isArray(data) ? data : (data.data || []);
      fillSelect('role_user_fk', roles, 'id', 'id');
      rolesMap = Object.fromEntries(roles.map(item => [item.id, `Rol #${item.id}`]));
    })
    .catch(error => {
      console.error('Error loading roles:', error);
    });
}

function fillSelect(selectId, data, valueField, textField) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option disabled selected value="">Seleccione una opción</option>';
  data.forEach(item => {
    let option = new Option(item[textField], item[valueField]);
    select.add(option);
  });
}

window.addEventListener('load', () => {
  loadView();
});