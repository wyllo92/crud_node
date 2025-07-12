document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('profile controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});


const objForm = new Form('profileForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelect = document.getElementById('user_id');
const objSelectDocument = document.getElementById('document_type_id');
const myForm = objForm.getForm();
const textConfirm = "¿Está seguro de que desea eliminar este perfil?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error de validación en el formulario");
    return;
  }
  toggleLoading(true);
  if (insertUpdate) {
    console.log("Insertando nuevo perfil");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PROFILE;
  } else {
    console.log("Actualizando perfil existente");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_PROFILE + keyId;
  }
  documentData = objForm.getDataForm();
  console.log("Datos del formulario:", documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Respuesta del servidor:", data);
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      alert(insertUpdate ? "Perfil creado exitosamente" : "Perfil actualizado exitosamente");
    }
  }).catch(error => {
    console.error("Error en la operación:", error);
    alert(`Error: ${error.message}`);
  }).finally(() => {
    loadView();
    showHiddenModal(false);
    toggleLoading(false);
  });
});

function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  // Limpiar los selects
  objSelect.innerHTML = "<option value='' selected disabled>Seleccione un usuario</option>";
  objSelectDocument.innerHTML = "<option value='' selected disabled>Seleccione tipo de documento</option>";
  // Cargar los datos de los selects
  getDataUser();
  getDataDocumentType();
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
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  keyId = id;
  getDataId(id);
  // Cargar los datos de los selects
  getDataUser();
  getDataDocumentType();
}

function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_PROFILE + id;
    toggleLoading(true);
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    }).then(data => {
      console.log("Respuesta del servidor:", data);
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert("Perfil eliminado exitosamente");
      }
    }).catch(error => {
      console.error("Error al eliminar:", error);
      alert(`Error: ${error.message}`);
    }).finally(() => {
      loadView();
      toggleLoading(false);
    });
  } else {
    console.log("Eliminación cancelada");
  }
}

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROFILE + id;
  toggleLoading(true);
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Datos del perfil:", data);
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      let getData = data["data"][0];
      objForm.setDataFormJson(getData);
    }
  }).catch(error => {
    console.error("Error al obtener datos:", error);
    alert(`Error: ${error.message}`);
  }).finally(() => {
    showHiddenModal(true);
    toggleLoading(false);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROFILE;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Datos de perfiles:", data);
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      createTable(data);
    }
  }).catch(error => {
    console.error("Error al obtener perfiles:", error);
    alert(`Error: ${error.message}`);
  }).finally(() => {
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {

  objTableBody.innerHTML = ""; // Clear previous table data
  let getData = data['data'];
  if (getData[0] === 0) {
    objTableBody.innerHTML = "<tr><td colspan='11' class='text-center'>No hay perfiles registrados</td></tr>";
    return;
  }
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Formatear la fecha de nacimiento solo como YYYY-MM-DD
    let fechaNacimiento = row.birth_date ? String(row.birth_date).substring(0, 10) : 'N/A';
    let dataRow = `<tr>
<td>${row.id}</td>
<td>${row.username || row.user_id}</td>
<td>${row.first_name || 'N/A'}</td>
<td>${row.last_name || 'N/A'}</td>
<td>${row.address || 'N/A'}</td>
<td>${row.phone || 'N/A'}</td>
<td>${row.document_type_name || row.document_type_id}</td>
<td>${row.document_number || 'N/A'}</td>
<td>${row.photo_url || 'N/A'}</td>
<td>${fechaNacimiento}</td>
<td>
<button type="button" title="Ver Perfil" class="btn btn-success btn-sm" onclick="showId(${row.id})"><i class='fas fa-eye'></i></button>
<button type="button" title="Editar Perfil" class="btn btn-primary btn-sm" onclick="edit(${row.id})"><i class='fas fa-edit' ></i></button>
<button type="button" title="Eliminar Perfil" class="btn btn-danger btn-sm" onclick="delete_(${row.id})"><i class='fas fa-trash' ></i></button> `;
    objTableBody.innerHTML += dataRow;
  }
}


function createSelect(data) {
  objSelect.innerHTML = "<option value='' selected disabled>Seleccione un usuario</option>";

  let getData = data['data'];
  if (getData[0] === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.id}">${row.username}</option>`;
    objSelect.innerHTML += dataRow;
  }
}

function createSelect2(data) {
  objSelectDocument.innerHTML = "<option value='' selected disabled>Seleccione tipo de documento</option>";

  let getData = data['data'];
  if (getData[0] === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.id}">${row.name}</option>`;
    objSelectDocument.innerHTML += dataRow;
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
  getData();
  toggleLoading(true);
}

function getDataUser() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER_ALL;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Datos de usuarios:", data);
    if (data.error) {
      console.error("Error al obtener usuarios:", data.error);
    } else {
      createSelect(data);
    }
  }).catch(error => {
    console.error("Error al obtener usuarios:", error);
  }).finally(() => {
    toggleLoading(false);
  });
}

function getDataDocumentType() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_DOCUMENT_TYPE;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Datos de tipos de documento:", data);
    if (data.error) {
      console.error("Error al obtener tipos de documento:", data.error);
    } else {
      createSelect2(data);
    }
  }).catch(error => {
    console.error("Error al obtener tipos de documento:", error);
  }).finally(() => {
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataUser();
  getDataDocumentType();
});

