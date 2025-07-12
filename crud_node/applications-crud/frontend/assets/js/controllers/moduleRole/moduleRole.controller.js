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
const objSelectModule = document.getElementById('module_fk');
const objSelectRole = document.getElementById('role_user_fk');
const myForm = objForm.getForm();
const textConfirm = "Press a button!\nEither OK or Cancel.";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

// Variables para mapear IDs a nombres
let modulesMap = {};
let userRolesMap = {};

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error");
    return;
  }
  toggleLoading(true);
  if (insertUpdate) {
    console.log("Insert");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_MODULE_ROLE;
  } else {
    console.log("Update");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_MODULE_ROLE + keyId;
  }
  documentData = objForm.getDataForm();
  
  // Convertir checkboxes no seleccionados a 0
  ['can_view', 'can_create', 'can_edit', 'can_delete'].forEach(field => {
    documentData[field] = document.getElementById(field).checked ? 1 : 0;
  });
  
  // Asegurar que module_fk y role_user_fk estén incluidos en la actualización
  if (!insertUpdate) {
    documentData.module_fk = document.getElementById('module_fk').value;
    documentData.role_user_fk = document.getElementById('role_user_fk').value;
  }
  //console.log(documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    //console.log(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
    loadView();
    showHiddenModal(false);
  });
});

function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
}

function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id);
}

function edit(id) {
  insertUpdate = false;
  keyId = id;
  
  // Resetear el formulario después de asegurar que los selects estén poblados
  Promise.all([getDataModules(), getDataUserRoles()])
    .then(() => {
      objForm.resetForm();
      objForm.enabledEditForm();
      objForm.enabledButton();
      objForm.showButton();
      getDataId(id);
    })
    .catch(error => {
      console.log(error);
      objForm.resetForm();
      objForm.enabledEditForm();
      objForm.enabledButton();
      objForm.showButton();
      getDataId(id);
    });
}

function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_MODULE_ROLE + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      //console.log(data);
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      //console.log("finally");
      loadView();
    });
  } else {
    console.log("cancel");
  }
}

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_MODULE_ROLE + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    let getData = data["data"];
    // Asegurar que los selects estén configurados correctamente
    if (getData.module_fk) {
      const moduleSelect = document.getElementById('module_fk');
      moduleSelect.value = getData.module_fk;
      // Trigger change event para asegurar que se actualice visualmente
      moduleSelect.dispatchEvent(new Event('change'));
    }
    if (getData.role_user_fk) {
      const roleSelect = document.getElementById('role_user_fk');
      roleSelect.value = getData.role_user_fk;
      // Trigger change event para asegurar que se actualice visualmente
      roleSelect.dispatchEvent(new Event('change'));
    }
    
    // Configurar los checkboxes
    if (getData.can_view !== undefined) {
      document.getElementById('can_view').checked = getData.can_view == 1 || getData.can_view === true;
    }
    if (getData.can_create !== undefined) {
      document.getElementById('can_create').checked = getData.can_create == 1 || getData.can_create === true;
    }
    if (getData.can_edit !== undefined) {
      document.getElementById('can_edit').checked = getData.can_edit == 1 || getData.can_edit === true;
    }
    if (getData.can_delete !== undefined) {
      document.getElementById('can_delete').checked = getData.can_delete == 1 || getData.can_delete === true;
    }
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_MODULE_ROLE;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    //Create table 
    //console.log(data['data']);
    createTable(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = ""; // Clear previous table data
  let getData = data['data'];
  if (getData[0] === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Usar los nombres directamente del backend si están disponibles
    let moduleName = row.module_name || modulesMap[row.module_fk] || `Módulo #${row.module_fk}`;
    let roleName = row.role_name || userRolesMap[row.role_user_fk] || `Rol #${row.role_user_fk}`;
    
    // Asegurar que los valores de permisos sean booleanos
    const canView = row.can_view === 1 || row.can_view === true;
    const canCreate = row.can_create === 1 || row.can_create === true;
    const canEdit = row.can_edit === 1 || row.can_edit === true;
    const canDelete = row.can_delete === 1 || row.can_delete === true;
    
    let dataRow = `<tr>
<td>${row.id}</td>
<td>${moduleName}</td>
<td>${roleName}</td>
<td><input type="checkbox" disabled ${canView ? "checked" : ""}></td>
<td><input type="checkbox" disabled ${canCreate ? "checked" : ""}></td>
<td><input type="checkbox" disabled ${canEdit ? "checked" : ""}></td>
<td><input type="checkbox" disabled ${canDelete ? "checked" : ""}></td>
<td>
<button type="button" title="Button Show" class="btn btn-success" onclick="showId(${row.id})"><i class='fas fa-eye'></i></button>
<button type="button" title="Button Edit" class="btn btn-primary" onclick="edit(${row.id})"><i class='fas fa-edit'></i></button>
<button type="button" title="Button Delete" class="btn btn-danger" onclick="delete_(${row.id})"><i class='fas fa-trash'></i></button>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectModule(data) {
  objSelectModule.innerHTML = "<option value='' selected disabled>Open this select menu</option>";

  let getData = data['data'];
  if (getData[0] === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.id}">${row.name}</option>`;
    objSelectModule.innerHTML += dataRow;
    modulesMap[row.id] = row.name;
  }
}

function createSelectRole(data) {
  objSelectRole.innerHTML = "<option value='' selected disabled>Open this select menu</option>";

  let getData = data['data'];
  if (getData[0] === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Solo mostrar el nombre del rol, no el usuario
    let dataRow = `<option value="${row.id}">${row.role_name}</option>`;
    objSelectRole.innerHTML += dataRow;
    userRolesMap[row.id] = row.role_name;
  }
}

function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

function loadView() {
  toggleLoading(true);
  // Primero cargar los datos de módulos y roles, luego la tabla principal
  Promise.all([getDataModules(), getDataUserRoles()])
    .then(() => {
      getData();
    })
    .catch(error => {
      console.log(error);
      toggleLoading(false);
    });
}

function getDataModules() {
  return new Promise((resolve, reject) => {
    documentData = "";
    httpMethod = METHODS[0]; // GET method
    endpointUrl = URL_MODULE;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      //Create table 
      //console.log(data['data']);
      createSelectModule(data);
      resolve();
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
}

function getDataUserRoles() {
  return new Promise((resolve, reject) => {
    documentData = "";
    httpMethod = METHODS[0]; // GET method
    endpointUrl = URL_USER_ID_ROLE;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      //Create table 
      //console.log(data['data']);
      createSelectRole(data);
      resolve();
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
}

window.addEventListener('load', () => {
  loadView();
});