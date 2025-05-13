// -------------------- CONFIG --------------------
const BASE_URL = "http://localhost:1337";

// -------------------- GLOBALS --------------------
const loginModal = document.querySelector("#login-modal");
const loginForm = document.querySelector("#login-form");
const loginText = document.querySelector("#login-text");
const openModalBtn = document.querySelector("#open-modal-btn");

const createAccountModal = document.querySelector("#createAccountModal");
const createAccountForm = document.querySelector("#createAccountForm");
const createAccountBtn = document.querySelector("#createAccountBtn");
const cancelCreateAccountBtn = document.querySelector(
  "#cancelCreateAccountBtn"
);
const closeCreateAccountModal = document.querySelector(
  "#closeCreateAccountModal"
);
const closeModal = document.querySelector(".close-modal-btn");

// -------------------- UTIL --------------------
function showModal(modal) {
  modal.classList.add("show");
  modal.classList.remove("hide");
}

function hideModal(modal) {
  modal.classList.remove("show");
  modal.classList.add("hide");
}

function getToken() {
  return localStorage.getItem("jwt");
}

function setWelcome(username) {
  const welcome = document.querySelector("#welcome-message");
  if (welcome) {
    welcome.textContent = `Welcome ${
      username.charAt(0).toUpperCase() + username.slice(1)
    }`;
  }
}

// -------------------- AUTH --------------------
async function loginUser(username, password) {
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: username,
      password,
    });
    localStorage.setItem("jwt", res.data.jwt);
    alert("Login successful!");
    handleLogin(res.data.user);
  } catch {
    alert("Login failed.");
  }
}

async function registerUser(username, email, password) {
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username,
      email,
      password,
    });
    localStorage.setItem("jwt", res.data.jwt);
    alert("Account created!");
    handleLogin(res.data.user);
  } catch (error) {
    if (error.response?.status === 400) {
      alert("Username already exists.");
    } else {
      alert("Registration failed.");
    }
  }
}

function handleLogin(user) {
  setWelcome(user.username);
  loginText.textContent = "Your Profile";
  addLogoutButton();
  renderBooks();
}

function logoutUser() {
  localStorage.removeItem("jwt");
  alert("Logged out.");
  loginText.textContent = "Login";
  document.querySelector("#welcome-message").textContent = "";
  document.querySelector(".logout-icon")?.remove();
  renderBooks();
}

// -------------------- EVENT LISTENERS --------------------
openModalBtn.addEventListener("click", (e) => {
  const token = getToken();
  if (!token) {
    showModal(loginModal);
  } else {
    renderProfile();
  }
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value.trim();
  loginUser(username, password);
  hideModal(loginModal);
});

createAccountBtn.addEventListener("click", (e) => {
  e.preventDefault();
  hideModal(loginModal);
  showModal(createAccountModal);
});

cancelCreateAccountBtn.addEventListener("click", (e) => {
  e.preventDefault();
  hideModal(createAccountModal);
});

closeModal.addEventListener("click", () => hideModal(loginModal));
closeCreateAccountModal.addEventListener("click", () =>
  hideModal(createAccountModal)
);

createAccountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector("#new-username").value.trim();
  const email = document.querySelector("#new-email").value.trim();
  const password = document.querySelector("#new-password").value;
  registerUser(username, email, password);
  hideModal(createAccountModal);
});

// -------------------- PROFILE & BOOKS --------------------
async function getMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await axios.get(
      `${BASE_URL}/api/users/me?populate=savedBooks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch {
    alert("Failed to fetch user.");
    return null;
  }
}

async function renderBooks() {
  const container = document.querySelector(".container-main");
  const token = getToken();
  const user = await getMe();
  const saved = user?.savedBooks?.map((b) => b.id) || [];

  try {
    const res = await axios.get(`${BASE_URL}/api/books?populate=*`);
    container.innerHTML =
      '<div id="welcome-message" class="welcome-message"></div><div class="book-list" id="book-list"></div>';
    const list = document.querySelector("#book-list");

    res.data.data.forEach((book) => {
      const div = document.createElement("div");
      div.className = "book-item";
      div.dataset.id = book.id;

      const isFav = saved.includes(book.id);
      const heart = token
        ? `<i class="fa-${
            isFav ? "solid" : "regular"
          } fa-heart" title="Save to favorites"></i>`
        : "";

      div.innerHTML = `
        <div class="heart-container">${heart}</div>
        <img src="${BASE_URL}${
        book.cover.formats.thumbnail.url
      }" width="100px" />
        <h3>${book.title}</h3>
        <h4>${book.author}</h4>
        <div class="stars" data-id="${book.id}">
          ${[1, 2, 3, 4, 5]
            .map((v) => `<i class="fa-regular fa-star" data-value="${v}"></i>`)
            .join("")}
        </div>
        <button class="buy-button">Buy</button>
      `;
      list.appendChild(div);
    });
  } catch {
    alert("Failed to load books.");
  }
}

async function renderProfile() {
  const user = await getMe();
  if (!user) return;

  const container = document.querySelector(".container-main");
  container.innerHTML = `
    <h2>Your Profile</h2>
    <label>Sort:</label>
    <select id="sort-saved">
      <option value="title">Title</option>
      <option value="author">Author</option>
    </select>
    <ul id="saved-books-list">${user.savedBooks
      .map(
        (book) => `
      <li data-title="${book.title}" data-author="${book.author}">
        <strong>${book.title}</strong> by ${book.author}
        <button class="remove-book" data-id="${book.id}">Remove</button>
      </li>`
      )
      .join("")}
    </ul>
  `;

  document.querySelectorAll(".remove-book").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const bookId = e.target.dataset.id;
      try {
        await axios.delete(`${BASE_URL}/api/users/me/toReadList/${bookId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        renderProfile();
      } catch {
        alert("Failed to remove.");
      }
    });
  });

  document.querySelector("#sort-saved").addEventListener("change", (e) => {
    const sortBy = e.target.value;
    const items = [...document.querySelectorAll("#saved-books-list li")];
    items.sort((a, b) => a.dataset[sortBy].localeCompare(b.dataset[sortBy]));
    const list = document.querySelector("#saved-books-list");
    list.innerHTML = "";
    items.forEach((item) => list.appendChild(item));
  });
}

function addLogoutButton() {
  if (!document.querySelector(".logout-icon")) {
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-door-open logout-icon";
    icon.style.cursor = "pointer";
    icon.addEventListener("click", logoutUser);
    loginText.parentElement.appendChild(icon);
  }
}

// -------------------- INTERACTION --------------------
document.addEventListener("click", async (e) => {
  const token = getToken();

  if (e.target.classList.contains("fa-heart")) {
    const heart = e.target;
    const bookId = heart.closest(".book-item").dataset.id;

    if (!token) return alert("Login first");

    try {
      if (heart.classList.contains("fa-solid")) {
        await axios.delete(`${BASE_URL}/api/users/me/favorites/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        heart.classList.replace("fa-solid", "fa-regular");
      } else {
        await axios.post(
          `${BASE_URL}/api/users/me/favorites`,
          { bookId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        heart.classList.replace("fa-regular", "fa-solid");
      }
    } catch {
      alert("Failed to update favorite.");
    }
  }

  if (e.target.classList.contains("fa-star")) {
    const rating = parseInt(e.target.dataset.value);
    const bookId = e.target.closest(".stars").dataset.id;
    try {
      await axios.post(
        `${BASE_URL}/api/books/${bookId}/ratings`,
        { rating },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Rating submitted.");
    } catch {
      alert("Failed to submit rating.");
    }
  }
});

// -------------------- INIT --------------------
document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();
  if (token) getMe().then((user) => handleLogin(user));
  renderBooks();
});
