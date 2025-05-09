const openModal = document.querySelector("#open-modal-btn");
const closeModal = document.querySelector(".close-modal-btn");
const loginModal = document.querySelector("#login-modal");
const loginText = document.querySelector("#login-text");
const loginForm = document.querySelector("#login-form");
const createAccountModal = document.querySelector("#createAccountModal");
const closeCreateAccountModal = document.querySelector(
  "#closeCreateAccountModal"
);
const createAccountForm = document.querySelector("#createAccountForm");
const createAccountBtn = document.querySelector("#createAccountBtn");
const cancelCreateAccountBtn = document.querySelector(
  "#cancelCreateAccountBtn"
);

const BASE_URL = "http://localhost:1337";

function showModal(modal) {
  modal?.classList.add("show");
  modal?.classList.remove("hide");
}

function hideModal(modal) {
  console.log("event");
  console.log(modal);
  modal?.classList.remove("show");
  modal?.classList.add("hide");
}

const renderBooks = async () => {
  try {
    let response = await axios.get(`${BASE_URL}/api/books?populate=*`);
    let books = response.data.data;

    let bookList = document.querySelector(".book-list");
    bookList.innerHTML = "";

    books.forEach((book) => {
      let coverUrl = book.cover.formats.thumbnail.url;

      let div = document.createElement("div");
      div.className = "book-item";
      div.dataset.id = book.id;
      div.innerHTML = `
      <div id="coverHeartContainer">
        ${
          coverUrl
            ? `<img src="${BASE_URL}${coverUrl}" alt="${book.title} cover" width="100px" />`
            : "<p>Ingen bild</p>"
        }
        <div class="heart-container">
          <i class="fa-regular fa-heart"></i>
        </div>
      </div>
        <h3 class="book-name">${book.title}</h3>
        <h4 class="book-author">${book.author}</h4>
        <p class="book-release-date">Date of Release: ${book.release_date}</p>
        <p class="book-length">${book.length} pages</p>
        <p class="book-rating">Rating: ${book.rating ?? ""}
          <span class="stars">
            <i class="fa-regular fa-star" data-value="1"></i>
            <i class="fa-regular fa-star" data-value="2"></i>
            <i class="fa-regular fa-star" data-value="3"></i>
            <i class="fa-regular fa-star" data-value="4"></i>
            <i class="fa-regular fa-star" data-value="5"></i>
          </span>
        </p>
        <p class="book-price"> Price: ${book.price} $</p>
        <button class="buy-button">Buy</button>`;
      bookList.appendChild(div);
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    alert("Failed to load books.");
  }
};

// Show and hide modal
openModal.addEventListener("click", (e) => {
  e.preventDefault();
  showModal(loginModal);
});

closeModal.addEventListener("click", () => {
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

closeCreateAccountModal.addEventListener("click", () => {
  hideModal(createAccountModal);
});

// Handle login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  if (!username || !password) {
    alert("Please fill in all fields.");
    return;
  }
  if (username.length < 3 || password.length < 3) {
    alert("Username and password must be at least 3 characters long.");
    return;
  }

  try {
    let response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: username,
      password: password,
    });
    const token = response.data.jwt;
    alert("Login successful!");
    localStorage.setItem("jwt", token);

    const capitalUsername =
      response.data.user.username.charAt(0).toUpperCase() +
      response.data.user.username.slice(1);

    const welcomeMessage = document.querySelector("#welcome-message");
    welcomeMessage.innerHTML = `Welcome ${capitalUsername}`;
    welcomeMessage.style.display = "block";

    loginText.innerHTML = `Logout`;
    loginText.style.display = "block";
    loginText.style.cursor = "pointer";
    loginText.addEventListener("click", () => {
      localStorage.removeItem("jwt");
      loginText.innerHTML = `Login`;
      loginText.style.cursor = "pointer";
      alert("Logged out successfully!");
    });

    hideModal(loginModal);
    console.log(response.data);
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Login failed.");
  }
});

createAccountForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.querySelector("#new-username").value.trim();
  const email = document.querySelector("#new-email").value.trim();
  const password = document.querySelector("#new-password").value;

  if (!username || !password || !email) {
    alert("Please fill in all fields.");
    return;
  }
  if (username.length < 3 || password.length < 3) {
    alert("Username and password must be at least 3 characters long.");
    return;
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username,
      email,
      password,
    });
    alert("Account created successfully!");
    const token = response.data.jwt;
    localStorage.setItem("jwt", token);

    const capitalUsername =
      response.data.user.username.charAt(0).toUpperCase() +
      response.data.user.username.slice(1);

    loginText.innerHTML = `Welcome ${capitalUsername}`;
    loginText.style.display = "block";
    hideModal(createAccountModal);

    console.log(response.data);
  } catch (error) {
    console.error("Error creating account:", error);
    if (error.response && error.response.status === 400) {
      alert("Username already exists.");
    } else {
      alert("Failed to create account.");
    }
  }
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("fa-star")) {
    const bookItem = e.target.closest(".book-item");
    const bookId = bookItem.dataset.id;
    const rating = e.target.dataset.value;

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Please log in to rate a book.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/books/${bookId}/ratings`,
        { rating: parseInt(rating) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating.");
    }
  }

  // Handle book purchase
  if (e.target.classList.contains("buy-button")) {
    const bookItem = e.target.closest(".book-item");
    const bookId = bookItem.dataset.id;

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Please log in to buy a book.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/books/${bookId}/buy`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Book purchased successfully!");
    } catch (error) {
      console.error("Error purchasing book:", error);
      alert("Failed to purchase book.");
    }
  }

  if (e.target.classList.contains("fa-heart")) {
    const button = e.target.closest(".fa-heart");
    const bookItem = button.closest(".book-item");

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Please log in to add a book to favorites.");
      return;
    }
    try {
      await axios.post(
        `${BASE_URL}/api/users/me/favorites`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      e.target.classList.add("addedHeart");
      alert("Book added to favorites!");
    } catch (error) {
      console.error("Error adding book to favorites:", error);
      alert("Failed to add book to favorites.");
    }
  }
});

renderBooks();
