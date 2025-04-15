// Switch between login and signup
function toggleForm(form) {
  document.getElementById('login-form').classList.toggle('d-none', form !== 'login');
  document.getElementById('signup-form').classList.toggle('d-none', form !== 'signup');
}

// Signup
document.getElementById('signup-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  if (localStorage.getItem(`user_${username}`)) {
    alert("User already exists!");
  } else {
    localStorage.setItem(`user_${username}`, JSON.stringify({ password, notes: [] }));
    alert("Signup successful! Please login.");
    toggleForm('login');
  }
});

// Login
document.getElementById('login-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const userData = JSON.parse(localStorage.getItem(`user_${username}`));
  if (userData && userData.password === password) {
    localStorage.setItem('loggedInUser', username);
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials!");
  }
});

// Logout
function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = "welcom.html";
}

// Dashboard on load
window.onload = function () {
  const user = localStorage.getItem('loggedInUser');
  if (window.location.pathname.includes('dashboard') && !user) {
    window.location.href = "index.html";
  }

  if (user && window.location.pathname.includes('dashboard')) {
    document.getElementById('username-display').textContent = `Hello, ${user}`;
    renderNotes();
  }
};

// Add note
function addNote() {
  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim();
  if (!noteText) return;

  const user = localStorage.getItem('loggedInUser');
  const data = JSON.parse(localStorage.getItem(`user_${user}`));
  data.notes.push(noteText);
  localStorage.setItem(`user_${user}`, JSON.stringify(data));

  noteInput.value = '';
  renderNotes();
}

// Render notes
function renderNotes() {
  const user = localStorage.getItem('loggedInUser');
  const data = JSON.parse(localStorage.getItem(`user_${user}`));
  const container = document.getElementById('notes-container');
  container.innerHTML = '';

  data.notes.forEach((note, index) => {
    container.innerHTML += `
      <div class="col-md-4 mb-3">
        <div class="card card-note shadow-sm animate__animated animate__fadeIn">
          <div class="card-body">
            <p class="card-text">${note}</p>
            <button class="btn btn-sm btn-warning" onclick="editNote(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteNote(${index})">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

// Delete note
function deleteNote(index) {
  const user = localStorage.getItem('loggedInUser');
  const data = JSON.parse(localStorage.getItem(`user_${user}`));
  data.notes.splice(index, 1);
  localStorage.setItem(`user_${user}`, JSON.stringify(data));
  renderNotes();
}

// Edit note
function editNote(index) {
  const newText = prompt("Edit your note:");
  if (newText !== null) {
    const user = localStorage.getItem('loggedInUser');
    const data = JSON.parse(localStorage.getItem(`user_${user}`));
    data.notes[index] = newText;
    localStorage.setItem(`user_${user}`, JSON.stringify(data));
    renderNotes();
  }
}
