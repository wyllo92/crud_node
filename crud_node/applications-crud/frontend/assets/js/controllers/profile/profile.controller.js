document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('profile controller has been loaded');
  
  // Initialize elements after DOM is loaded
  initializeElements();
  
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen
});

// Global variables
let objForm, objModal, objTableBody, objSelect, objSelectDocument, myForm;
let photoFileInput, photoUrlInput, photoPreview, photoPreviewContainer;
let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";
const textConfirm = "Press a button!\nEither OK or Cancel.";
const appTable = "#app-table";

// Initialize all DOM elements
function initializeElements() {
  console.log('Initializing elements...');
  
  objForm = new Form('profileForm', 'edit-input');
  objModal = new bootstrap.Modal(document.getElementById('appModal'));
  objTableBody = document.getElementById('app-table-body');
  objSelect = document.getElementById('user_id');
  objSelectDocument = document.getElementById('document_type_id');
  myForm = objForm.getForm();

  // Photo upload elements
  photoFileInput = document.getElementById('photo_file');
  photoUrlInput = document.getElementById('photo_url');
  photoPreview = document.getElementById('photo_preview');
  photoPreviewContainer = document.getElementById('photo_preview_container');

  console.log('Photo file input found:', photoFileInput);
  console.log('Photo URL input found:', photoUrlInput);
  console.log('Photo preview found:', photoPreview);
  console.log('Photo preview container found:', photoPreviewContainer);

  // Add event listener for photo file input
  if (photoFileInput) {
    // Remove any existing event listeners
    photoFileInput.removeEventListener('change', handlePhotoUpload);
    
    // Add the event listener
    photoFileInput.addEventListener('change', handlePhotoUpload);
    console.log('Event listener added to photo file input');
    
    // Add a test event listener to verify the input is working
    photoFileInput.addEventListener('click', () => {
      console.log('Photo file input clicked');
    });
    
    // Test if the input is accessible
    console.log('Photo file input accept attribute:', photoFileInput.accept);
    console.log('Photo file input type:', photoFileInput.type);
  } else {
    console.error('Photo file input not found!');
  }

  // Add form submit event listener
  if (myForm) {
    myForm.addEventListener('submit', handleFormSubmit);
    console.log('Form submit event listener added');
    
    // Add additional event listener to prevent form submission on Enter key
    myForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        console.log('Enter key pressed, preventing form submission');
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    // Add event listener to prevent form submission when file input changes
    myForm.addEventListener('change', (e) => {
      if (e.target.id === 'photo_file') {
        console.log('File input change detected in form, preventing form submission');
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }
}

// Helper function to normalize image URLs
function normalizeImageUrl(url) {
  if (!url) return HOST + '/data/uploads/default-profile.svg';
  
  // Handle old references
  if (url === 'img.jpg' || url === '') {
    return HOST + '/data/uploads/default-profile.svg';
  }
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's the default image, add server path
  if (url === 'default-profile.svg') {
    return HOST + '/data/uploads/default-profile.svg';
  }
  
  // If it's a relative path, add server path
  if (!url.startsWith('/data/uploads/')) {
    return HOST + url;
  }
  
  // If it already has the correct path, add server
  return HOST + url;
}

function handleFormSubmit(e) {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error");
    return;
  }
  toggleLoading(true);
  if (insertUpdate) {
    console.log("Insert");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PROFILE;
  } else {
    console.log("Update");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_PROFILE + keyId;
  }
  documentData = objForm.getDataForm();
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
}

async function handlePhotoUpload(event) {
  console.log('handlePhotoUpload called');
  console.log('Event:', event);
  console.log('Event target:', event.target);
  
  // Prevent any default behavior that might cause form submission
  event.preventDefault();
  event.stopPropagation();
  
  const file = event.target.files[0];
  console.log('Selected file:', file);
  
  if (!file) {
    console.log('No file selected');
    // If no file selected, keep the current photo if editing
    if (!insertUpdate && photoUrlInput.value && !photoUrlInput.value.includes('default-profile.svg')) {
      showPhotoPreview(photoUrlInput.value);
    } else {
      hidePhotoPreview();
    }
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  console.log('File type:', file.type);
  if (!allowedTypes.includes(file.type)) {
    alert('Please select a valid image file (JPEG, PNG, or GIF)');
    event.target.value = '';
    // Restore previous photo if editing
    if (!insertUpdate && photoUrlInput.value && !photoUrlInput.value.includes('default-profile.svg')) {
      showPhotoPreview(photoUrlInput.value);
    }
    return;
  }

  // Validate file size (5MB)
  console.log('File size:', file.size);
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    event.target.value = '';
    // Restore previous photo if editing
    if (!insertUpdate && photoUrlInput.value && !photoUrlInput.value.includes('default-profile.svg')) {
      showPhotoPreview(photoUrlInput.value);
    }
    return;
  }

  try {
    console.log('Starting file upload...');
    toggleLoading(true);
    
    // Upload file using FormData
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadUrl = HOST + '/upload';
    console.log('Upload URL:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      },
      body: formData
    });
    
    console.log('Upload response:', response);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      alert('Error uploading file: ' + (errorText || 'Unknown error'));
      // Restore previous photo if editing
      if (!insertUpdate && photoUrlInput.value && !photoUrlInput.value.includes('default-profile.svg')) {
        showPhotoPreview(photoUrlInput.value);
      }
      return;
    }
    
    const result = await response.json();
    console.log('Upload result:', result);

    if (result.file && result.file.filename) {
      // Set the photo URL
      const photoUrl = `/data/uploads/${result.file.filename}`;
      console.log('Setting photo URL:', photoUrl);
      photoUrlInput.value = photoUrl;
      
      // Show preview with full server path
      showPhotoPreview(photoUrl);
    } else {
      console.error('Invalid response format:', result);
      alert('Error: Invalid response from server');
      // Restore previous photo if editing
      if (!insertUpdate && photoUrlInput.value && !photoUrlInput.value.includes('default-profile.svg')) {
        showPhotoPreview(photoUrlInput.value);
      }
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Error uploading file. Please try again.');
    // Restore previous photo if editing
    if (!insertUpdate && photoUrlInput.value && !photoUrlInput.value.includes('default-profile.svg')) {
      showPhotoPreview(photoUrlInput.value);
    }
  } finally {
    toggleLoading(false);
  }
  
  // Prevent form submission
  return false;
}

function showPhotoPreview(url) {
  // Normalize the URL to ensure it has the correct server path
  const normalizedUrl = normalizeImageUrl(url);
  
  photoPreview.onload = function() {
    photoPreviewContainer.style.display = 'block';
  };
  photoPreview.onerror = function() {
    console.log('Error loading image:', normalizedUrl);
    // If it's not the default image, try to use default
    if (!normalizedUrl.includes('default-profile.svg')) {
      console.log('Falling back to default image');
      photoPreview.src = HOST + '/data/uploads/default-profile.svg';
      photoUrlInput.value = 'default-profile.svg';
    } else {
      photoPreviewContainer.style.display = 'none';
    }
  };
  photoPreview.src = normalizedUrl;
}

function hidePhotoPreview() {
  photoPreviewContainer.style.display = 'none';
  photoPreview.src = '';
  // Set default image URL when hiding preview
  if (photoUrlInput.value === '') {
    photoUrlInput.value = 'default-profile.svg';
  }
}

function clearPhotoFile() {
  // Clear the file input
  photoFileInput.value = '';
  
  // If editing, keep the current photo URL but hide preview if it's default
  if (!insertUpdate) {
    if (photoUrlInput.value && !photoUrlInput.value.includes('default-profile.svg')) {
      showPhotoPreview(photoUrlInput.value);
    } else {
      hidePhotoPreview();
    }
  } else {
    // If adding new, set default image
    photoUrlInput.value = 'default-profile.svg';
    hidePhotoPreview();
  }
}

function showPhotoModal(photoUrl) {
  // Normalize the URL to ensure it has the correct server path
  const normalizedUrl = normalizeImageUrl(photoUrl);
  
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="photoModal" tabindex="-1" aria-labelledby="photoModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="photoModalLabel">Profile Photo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <img src="${normalizedUrl}" alt="Profile Photo" class="img-fluid" id="modalPhoto" onerror="handleModalImageError(this);">
            <div id="modalErrorMsg" style="display: none; color: #666; padding: 20px;">Image not found</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('photoModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const photoModal = new bootstrap.Modal(document.getElementById('photoModal'));
  photoModal.show();
  
  // Remove modal from DOM when hidden
  document.getElementById('photoModal').addEventListener('hidden.bs.modal', function () {
    this.remove();
  });
}

// Helper function to handle image errors in modal
function handleModalImageError(imgElement) {
  try {
    if (imgElement && imgElement.parentNode) {
      imgElement.style.display = 'none';
      const errorMsg = imgElement.parentNode.querySelector('#modalErrorMsg');
      if (errorMsg) {
        errorMsg.style.display = 'block';
      }
    }
  } catch (error) {
    console.log('Error handling modal image error:', error);
  }
}

// Helper function to handle image errors in table
function handleTableImageError(imgElement) {
  try {
    if (imgElement && imgElement.parentNode) {
      imgElement.style.display = 'none';
      const errorMsg = imgElement.parentNode.querySelector('.table-error-msg');
      if (errorMsg) {
        errorMsg.style.display = 'inline';
      }
    }
  } catch (error) {
    console.log('Error handling table image error:', error);
  }
}

function add() {
  insertUpdate = true;
  
  // Asegurar que los selects estén poblados antes de mostrar el modal
  Promise.all([getDataUser(), getDataDocumentType()])
    .then(() => {
      objForm.resetForm();
      photoFileInput.value = ''; // Clear file input
      photoUrlInput.value = 'default-profile.svg'; // Set default image
      hidePhotoPreview();
      objForm.enabledForm();
      objForm.enabledButton();
      objForm.showButton();
      showHiddenModal(true);
    })
    .catch(error => {
      console.log(error);
      objForm.resetForm();
      photoFileInput.value = ''; // Clear file input
      photoUrlInput.value = 'default-profile.svg'; // Set default image
      hidePhotoPreview();
      objForm.enabledForm();
      objForm.enabledButton();
      objForm.showButton();
      showHiddenModal(true);
    });
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
  
  // Asegurar que los selects estén poblados antes de cargar los datos
  Promise.all([getDataUser(), getDataDocumentType()])
    .then(() => {
      objForm.resetForm();
      // Don't clear file input when editing - allow user to change photo
      objForm.enabledEditForm();
      objForm.enabledButton();
      objForm.showButton();
      getDataId(id);
    })
    .catch(error => {
      console.log(error);
      objForm.resetForm();
      // Don't clear file input when editing - allow user to change photo
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
    endpointUrl = URL_PROFILE + id;
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
  endpointUrl = URL_PROFILE + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    let getData = data["data"][0];
    console.log('Profile data received:', getData);
    
    // Asegurar que los selects estén configurados correctamente
    if (getData.user_id) {
      const userSelect = document.getElementById('user_id');
      userSelect.value = getData.user_id;
      // Trigger change event para asegurar que se actualice visualmente
      userSelect.dispatchEvent(new Event('change'));
    }
    if (getData.document_type_id) {
      const documentSelect = document.getElementById('document_type_id');
      documentSelect.value = getData.document_type_id;
      // Trigger change event para asegurar que se actualice visualmente
      documentSelect.dispatchEvent(new Event('change'));
    }
    
    // Configurar los demás campos usando el método estándar
    objForm.setDataFormJson(getData);
    
    // Handle birth_date specifically for date input
    if (getData.birth_date) {
      const birthDateInput = document.getElementById('birth_date');
      if (birthDateInput) {
        // Convert the date to YYYY-MM-DD format for HTML date input
        const date = new Date(getData.birth_date);
        const formattedDate = date.toISOString().split('T')[0];
        console.log('Original birth_date:', getData.birth_date);
        console.log('Formatted birth_date:', formattedDate);
        birthDateInput.value = formattedDate;
      }
    }
    
    // Handle old photo references before showing preview
    if (getData.photo_url === 'img.jpg' || getData.photo_url === '') {
      getData.photo_url = 'default-profile.svg';
      photoUrlInput.value = 'default-profile.svg';
    }
    
    // Show photo preview if exists and is not default
    if (getData.photo_url && !getData.photo_url.includes('default-profile.svg')) {
      showPhotoPreview(getData.photo_url);
    } else {
      hidePhotoPreview();
    }
    
    // Enable file input for editing - user can change the photo
    photoFileInput.disabled = false;
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
  endpointUrl = URL_PROFILE;
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
    // Create photo cell
    let photoCell = 'N/A';
    if (row.photo_url && row.photo_url !== 'N/A') {
      // Handle old photo references and normalize URL
      let photoUrl = row.photo_url;
      if (photoUrl === 'img.jpg' || photoUrl === '') {
        photoUrl = 'default-profile.svg';
      }
      
      const normalizedUrl = normalizeImageUrl(photoUrl);
      const isDefaultImage = row.photo_url.includes('default-profile.svg');
      const clickHandler = isDefaultImage ? '' : `onclick="showPhotoModal('${normalizedUrl}')"`;
      const cursorStyle = isDefaultImage ? 'cursor: default;' : 'cursor: pointer;';
      
      photoCell = `<img src="${normalizedUrl}" alt="Profile Photo" class="img-thumbnail" style="max-width: 50px; max-height: 50px; ${cursorStyle}" ${clickHandler} onerror="handleTableImageError(this);">
      <span class="table-error-msg" style="display: none; color: #666;">No Image</span>`;
    }
    
    let dataRow = `<tr>
<td>${row.id}</td>
<td>${row.username || row.user_id}</td>
<td>${row.first_name || 'N/A'}</td>
<td>${row.last_name || 'N/A'}</td>
<td>${row.address || 'N/A'}</td>
<td>${row.phone || 'N/A'}</td>
<td>${row.document_type_name || row.document_type_id}</td>
<td>${row.document_number || 'N/A'}</td>
<td>${photoCell}</td>
<td>${row.birth_date ? String(row.birth_date).substring(0, 10) : 'N/A'}</td>
<td>
<button type="button" title="Button Show" class="btn btn-success" onclick="showId(${row.id})"><i class='fas fa-eye'></i></button>
<button type="button" title="Button Edit" class="btn btn-primary" onclick="edit(${row.id})"><i class='fas fa-edit'></i></button>
<button type="button" title="Button Delete" class="btn btn-danger" onclick="delete_(${row.id})"><i class='fas fa-trash'></i></button>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelect(data) {
  objSelect.innerHTML = "<option value='' selected disabled>Open this select menu</option>";

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
  objSelectDocument.innerHTML = "<option value='' selected disabled>Open this select menu</option>";

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
  return new Promise((resolve, reject) => {
    documentData = "";
    httpMethod = METHODS[0]; // GET method
    endpointUrl = URL_USER_ALL;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      //Create table 
      //console.log(data['data']);
      createSelect(data);
      resolve();
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
}

function getDataDocumentType() {
  return new Promise((resolve, reject) => {
    documentData = "";
    httpMethod = METHODS[0]; // GET method
    endpointUrl = URL_DOCUMENT_TYPE;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      //Create table 
      //console.log(data['data']);
      createSelect2(data);
      resolve();
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataUser();
  getDataDocumentType();
  // Update old photo references on load
  updateOldPhotoReferences();
});

async function updateOldPhotoReferences() {
  try {
    const response = await fetch(HOST + '/profile/update-photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const result = await response.json();
    if (result.updatedCount > 0) {
      console.log(`Updated ${result.updatedCount} old photo references`);
    }
  } catch (error) {
    console.log('Error updating photo references:', error);
  }
}

