const openModalBtn = document.querySelector("#open-modal-btn");
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
const removeBookBtn = document.querySelector("#removeBookBtn");

const BASE_URL = "http://localhost:1337";

function showModal(modal) {
  modal?.classList.add("show");
  modal?.classList.remove("hide");
}

function handleLogin(userData) {
  if (userData) {
    const capitalUsername =
      userData.username.charAt(0).toUpperCase() + userData.username.slice(1);

    const welcomeMessage = document.querySelector("#welcome-message");
    if (welcomeMessage) {
      welcomeMessage.innerHTML = `Welcome ${capitalUsername}`;
    }

    loginText.innerHTML = `Your Profile`;
    loginText.style.cursor = "pointer";

    if (!document.querySelector(".logout-icon")) {
      addLogutBtn();
    }
    if (!document.querySelector(".book-icon")) {
      backToBooks();
    }
  }
}

function addLogutBtn() {
  const logoutIcon = document.createElement("i");
  logoutIcon.className = "fa-solid fa-door-open logout-icon";
  logoutIcon.style.cursor = "pointer";
  logoutIcon.style.marginLeft = "10px";
  loginText.parentElement.appendChild(logoutIcon);

  logoutIcon.addEventListener("click", handleLogout);
}

function handleLogout() {
  localStorage.removeItem("jwt");
  alert("You have been logged out.");
  loginText.innerHTML = "Login";
  loginText.style.cursor = "pointer";

  const welcomeMessage = document.querySelector("#welcome-message");
  if (welcomeMessage) {
    welcomeMessage.innerHTML = "";
  }
  const logoutIcon = document.querySelector(".logout-icon");
  if (logoutIcon) {
    logoutIcon.remove();
  }
  const bookIcon = document.querySelector(".book-icon-container");
  if (bookIcon) {
    bookIcon.remove();
  }
  renderBooks();
}

document.addEventListener("DOMContentLoaded", async () => {
  await updateLogionStatus();
  const userData = await getMe();
  if (userData) {
    renderProfile();
  }
});

function hideModal(modal) {
  modal?.classList.remove("show");
  modal?.classList.add("hide");
}

function openLogionModal(e) {
  e.preventDefault();
  showModal(loginModal);
}

async function updateLogionStatus() {
  const userData = await getMe();
  if (userData) {
    handleLogin(userData);
    backToBooks(userData);
  } else {
    loginText.innerHTML = "Login";
    loginText.style.cursor = "pointer";
  }
}

openModalBtn.addEventListener("click", (e) => {
  if (e.target.id === "login-text" || e.target.closest("#login-text")) {
    const token = localStorage.getItem("jwt");
    if (!token) {
      openLogionModal(e);
      return;
    }
    renderProfile();
  }
});

closeModal.addEventListener("click", () => hideModal(loginModal));

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

closeModal.addEventListener("click", () => {
  hideModal(loginModal);
});

createAccountBtn.addEventListener("click", (e) => {
  e.preventDefault();
  hideModal(loginModal);
  showModal(createAccountModal);
});

function backToBooks(userData) {
  if (!userData) {
    return;
  }
  if (!document.querySelector(".book-icon-container")) {
    const bookIconContainer = document.createElement("div");
    bookIconContainer.className = "book-icon-container";
    bookIconContainer.style.display = "flex";
    bookIconContainer.style.alignItems = "center";
    bookIconContainer.style.cursor = "pointer";
    bookIconContainer.style.marginLeft = "10px";

    const bookIcon = document.createElement("i");
    bookIcon.className = "fa-solid fa-book book-icon";
    bookIcon.style.marginRight = "5px";

    // Create text label
    const bookText = document.createElement("span");
    bookText.textContent = "View All Books";
    bookText.className = "book-text";
    bookText.style.fontSize = "0.9rem";

    // Add icon and text to container
    bookIconContainer.appendChild(bookIcon);
    bookIconContainer.appendChild(bookText);

    // Add to the DOM
    const loginSection = loginText.parentElement;
    loginSection.appendChild(bookIconContainer);

    // Add click event to the container
    bookIconContainer.addEventListener("click", () => {
      const profileContainer = document.querySelector(".container-main");
      const isUser = document.querySelector(".saved-books");
      if (isUser) {
        profileContainer.innerHTML = `
              <div id="welcome-message" class="welcome-message"></div>
              <div class="book-list" id="book-list"></div>
            `;
        renderBooks();
      } else {
        renderProfile();
      }
      updateLogionStatus();
    });
  }
}

const renderBooks = async (userData) => {
  try {
    let response = await axios.get(`${BASE_URL}/api/books?populate=*`);
    let books = response.data.data;

    const mainContainer = document.querySelector(".container-main");
    mainContainer.innerHTML = `
      <div id="welcome-message" class="welcome-message"></div>
      <div class="book-list" id="book-list"></div>
    `;

    let bookList = document.querySelector(".book-list");
    bookList.innerHTML = "";

    books.forEach((book) => {
      let coverUrl = book.cover.formats.thumbnail.url;

      const isLoggedIn = localStorage.getItem("jwt");
      const isSaved =
        userData &&
        userData.savedBooks &&
        userData.savedBooks.some((savedBook) => savedBook.id === book.id);

      let div = document.createElement("div");
      div.className = "book-item";
      div.dataset.id = book.id;
      div.innerHTML = ` 
        <div class="heart-container">
        ${
          coverUrl
            ? `<img src="${BASE_URL}${coverUrl}" alt="${book.title} cover" width="100px" />`
            : "<p>Ingen bild</p>"
        }
        ${
          isLoggedIn
            ? `
            <div class="heart-container">
              <i class="fa-${
                isSaved ? "solid" : "regular"
              } fa-heart" title="Save to favorites"></i>
            </div>`
            : ""
        }
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
    updateLogionStatus();
  } catch (error) {
    console.error("Error fetching books:", error);
    alert("Failed to load books.");
  }
};

// Handle login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value.trim();

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
      password,
    });
    const token = response.data.jwt;
    alert("Login successful!");
    localStorage.setItem("jwt", token);

    // <div id="coverHeartContainer">
    // <div class="heart-container">
    // <i class="fa-regular fa-heart"></i>
    // </div>

    handleLogin(response.data.user);
    hideModal(loginModal);
    renderBooks();
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Login failed.");
  }
});

const renderProfile = async () => {
  const token = localStorage.getItem("jwt");
  if (!token) {
    return;
  }
  try {
    const user = await getMe();
    console.log("User data:", user);
    const savedBooks = user.savedBooks ?? [];

    const profileContainer = document.querySelector(".container-main");
    profileContainer.innerHTML = `
        <div id="welcome-message" class="welcome-message"></div>
        <h2>Your Profile </h2>
        <div>
          <label>Sort by:</label>
          <select id="sort-books">
            <option value="">Options</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>
        <ul id="saved-books-list" class="saved-books">
          ${savedBooks.length === 0 ? "<p>No saved books</p>" : ""}
          ${savedBooks.length > 0 ? "<h3>Saved Books</h3>" : ""}
          ${savedBooks
            .map(
              (book) =>
                `<li>${book.title}</li>
             <p>${book.author}</p>
             <button class="rate-book" data-id="${book.id}">Rate</button>
             <div class="rating">
             <i class="fa-regular fa-star" data-value="1"></i>
             <i class="fa-regular fa-star" data-value="2"></i>
             <i class="fa-regular fa-star" data-value="3"></i>
             <i class="fa-regular fa-star" data-value="4"></i>
             <i class="fa-regular fa-star" data-value="5"></i>
             </div>
             <button class="remove-book" data-id="${book.id}">Remove</button>
             <button class="buy-book" data-id="${book.id}">Buy</button>
             `
            )
            .join("")}
        </ul>
      `;

    updateLogionStatus();

    if (savedBooks.length > 0) {
      // Fix: Add event listeners to ALL remove buttons
      document.querySelectorAll(".remove-book").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const bookId = e.target.dataset.id;
          try {
            await axios.delete(
              `${BASE_URL}/api/users/me/toReadList/${bookId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            alert("Book removed from favorites!");
            renderProfile();
          } catch (error) {
            console.error("Error removing book:", error);
            alert("Failed to remove book.");
          }
        });
      });

      // Fix: Correct selector for sort-books (use ID)
      document.querySelector("#sort-books").addEventListener("change", (e) => {
        const sortBy = e.target.value;
        const sortedBooks = Array.from(
          document.querySelectorAll(".saved-books li")
        );
        sortedBooks.sort((a, b) => {
          return a.dataset[sortBy].localeCompare(b.dataset[sortBy]); // Add return statement
        });
        const ul = document.querySelector("#saved-books-list");
        ul.innerHTML = "";
        sortedBooks.forEach((li) => {
          ul.appendChild(li);
        });
      });
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    alert("Failed to load profile.");
  }
};

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

    handleLogin(response.data.user);
    hideModal(createAccountModal);
    renderProfile();
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
    const heartIcon = e.target.closest(".fa-heart");
    const bookItem = button.closest(".book-item");
    const bookId = bookItem.dataset.id;

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Please log in to add a book to favorites.");
      return;
    }
    try {
      if (heartIcon.classList.contains("fa-solid")) {
        await axios.delete(`${BASE_URL}/api/users/me/favorites/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        heartIcon.classList.remove("fa-solid");
        heartIcon.classList.add("fa-regular");
        alert("Book removed from favorites!");
      } else {
        await axios.post(
          `${BASE_URL}/api/users/me/favorites`,
          { bookId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid");
        alert("Book added to favorites!");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Failed to update favorites.");
    }
  }
});

async function getMe() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    return null; // Return null if no token is found
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/api/users/me?populate=savedBooks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data; // Return the user data
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Failed to load user data.");
    return null; // Return null in case of an error
  }
}

async function updateSavedBooks(userId, bookIds) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    alert("Please log in to save books.");
    return null; // Return null if no token is found
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/users/${userId}`,
      {
        savedBooks: bookIds,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data; // Return the updated user data
  } catch (error) {
    alert("Failed to update saved books.");
    return null; // Return null in case of an error
  }
}

async function updateBookRating(bookname, rating) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    alert("Please log in to rate books.");
    return null;
  }

  try {
    const userData = await getMe();
    if (!userData) {
      throw new Error("Could not fetch current user data");
    }

    // Get existing ratings or initialize empty array
    const existingRatings = userData.bookRatings || [];

    // Check if this book already has a rating
    const existingRatingIndex = existingRatings.findIndex(
      (item) => item.bookname === bookname
    );

    let updatedRatings;
    if (existingRatingIndex >= 0) {
      // Update existing rating
      updatedRatings = [...existingRatings];
      updatedRatings[existingRatingIndex] = {
        ...updatedRatings[existingRatingIndex],
        rating,
      };
    } else {
      // Add new rating
      updatedRatings = [...existingRatings, { bookname, rating }];
    }

    // Send the complete updated array to the server
    const response = await axios.put(
      `${BASE_URL}/api/users/${userData.id}`,
      {
        bookRatings: updatedRatings,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Book rating updated successfully!");
    return response.data;
  } catch (error) {
    console.error("Error updating book rating:", error);
    alert("Failed to update book rating.");
    return null;
  }
}

renderBooks();
