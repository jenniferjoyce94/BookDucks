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

// ------------------------function------------------------
function showModal(modal) {
  modal?.classList.add("show");
  modal?.classList.remove("hide");
}

function hideModal(modal) {
  modal?.classList.remove("show");
  modal?.classList.add("hide");
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

async function changeTheme() {
  try {
    const response = await axios.get(`${BASE_URL}/api/theme-setting`);
    const theme = response.data.data.theme;

    document.documentElement.setAttribute("data-theme", theme);
    console.log(`Theme set to ${theme}`);

    const logos = document.querySelectorAll(".theme-logo");
    logos.forEach((logo) => {
      logo.style.display = "none";
    });

    const currentLogo = document.querySelector(`.${theme}-logo`);
    if (currentLogo) {
      currentLogo.style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching theme settings:", error);
    document.documentElement.setAttribute("data-theme", "default");

    const logos = document.querySelectorAll(".theme-logo");
    logos.forEach((logo) => {
      logo.style.opacity = "0";
      logo.style.display = "none";
    });

    const defaultLogo = document.querySelector(".default-logo");
    if (defaultLogo) {
      defaultLogo.style.display = "block";
    }
    console.log("Default theme applied.");
  }
}
// ------------------------Authorization------------------------
async function loginUser(username, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: username,
      password,
    });
    localStorage.setItem("jwt", response.data.jwt);
    handleLogin(response.data.user);
  } catch {
    alert("Login failed.");
  }
}

async function registerUser(username, email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username,
      email,
      password,
    });
    localStorage.setItem("jwt", response.data.jwt);
    alert("Account created!");
    handleLogin(response.data.user);
  } catch (error) {
    if (error.response?.status === 400) {
      alert("Username already exists.");
    } else {
      alert("Registration failed.");
    }
  }
}

function handleLogin(user) {
  if (!user) {
    return;
  } else if (user) {
    setWelcome(user.username);
    loginText.textContent = "Your Profile";
    backToBooks(user);
    addLogutBtn();
  }
  renderBooks();
}

function handleLogout() {
  localStorage.removeItem("jwt");

  loginText.innerHTML = "Login";
  loginText.style.cursor = "pointer";

  const welcomeMessage = document.querySelector("#welcome-message");
  if (welcomeMessage) {
    welcomeMessage.textContent = "";
  }
  const logoutContainer = document.querySelector(".logout-icon-container");
  if (logoutContainer) {
    logoutContainer.remove();
  }
  const bookIconContainer = document.querySelector(".book-icon-container");
  if (bookIconContainer) {
    bookIconContainer.remove();
  }

  hideModal(loginModal);
  hideModal(createAccountModal);

  window.location.reload();
}

function addLogutBtn() {
  const logoutContainer = document.createElement("div");
  logoutContainer.className = "logout-icon-container";

  const logoutIcon = document.createElement("i");
  logoutIcon.className = "fa-solid fa-door-open logout-icon theme-icon";

  const logoutText = document.createElement("span");
  logoutText.textContent = "Logout";
  logoutText.className = "logout-text";

  logoutContainer.appendChild(logoutIcon);
  logoutContainer.appendChild(logoutText);

  const loginSection = loginText.parentElement;
  loginSection.appendChild(logoutContainer);
  logoutContainer.addEventListener("click", handleLogout);
}

function countSolidStars(starsContainer) {
  return starsContainer.querySelectorAll(".fa-solid.fa-star").length;
}
// ------------------------eventListner------------------------
openModalBtn.addEventListener("click", (e) => {
  const token = getToken();
  if (!token) {
    showModal(loginModal);
  } else {
    renderProfile();
  }
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
closeCreateAccountModal.addEventListener("click", () => {
  hideModal(createAccountModal);
});

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
    localStorage.setItem("jwt", token);

    handleLogin(response.data.user);
    hideModal(loginModal);
    renderBooks();
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
    const starsContainer = e.target.closest(".stars");

    let bookId;
    if (bookItem) {
      bookId = bookItem.dataset.id;
    } else if (starsContainer) {
      bookId = starsContainer.dataset.id;
    } else {
      console.error("Book ID not found.");
      return;
    }

    const rating = e.target.dataset.value;
    const token = getToken();
    if (!token) {
      alert("Please log in to rate a book.");
      return;
    }

    try {
      const userData = await getMe();
      if (!userData) {
        alert("Unable to retrieve user information.");
        return;
      }
      await axios.post(
        `${BASE_URL}/api/book-ratings`,
        {
          data: {
            rating: rating,
            book: {
              id: bookId,
            },
            users_permissions_user: userData.id,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const stars = e.target.closest(".stars").querySelectorAll(".fa-star");
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.remove("fa-regular");
          star.classList.add("fa-solid");
        } else {
          star.classList.remove("fa-solid");
          star.classList.add("fa-regular");
        }
      });
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
    } catch (error) {
      console.error("Error purchasing book:", error);
      alert("Failed to purchase book.");
    }
  }

  if (e.target.classList.contains("fa-heart")) {
    const heartIcon = e.target;
    const bookItem = heartIcon.closest(".book-item");
    const bookId = parseInt(bookItem.dataset.id);
    const user = await getMe();

    if (!user) {
      alert("Please log in to add a book to favorites.");
      return;
    }

    try {
      if (heartIcon.classList.contains("fa-solid")) {
        await removeSavedBooks(user.id, bookId);
        heartIcon.classList.remove("fa-solid");
        heartIcon.classList.add("fa-regular");
      } else {
        await addSavedBooks(user.id, bookId);
        heartIcon.classList.remove("fa-regular");
        heartIcon.classList.add("fa-solid");
      }

      if (document.querySelector("#saved-books-list")) {
        renderProfile();
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  }
});
// ------------------------render Profil and Books------------------------

async function getMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await axios.get(`${BASE_URL}/api/users/me?populate=*`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    alert("Failed to fetch user.");
    return null;
  }
}

async function renderBooks() {
  const token = getToken();
  const userData = await getMe();
  const savedBooks = userData?.savedBooks?.map((b) => b.id) || [];

  const container = document.querySelector(".container-main");
  try {
    let response = await axios.get(`${BASE_URL}/api/books?populate=*`);
    const books = response.data.data;
    container.innerHTML =
      '<div id="welcome-message" class="welcome-message"></div><div class="book-list" id="book-list"></div>';

    if (userData) {
      setWelcome(userData.username);
    }

    const booksList = document.querySelector("#book-list");

    books.forEach((book) => {
      let coverUrl = book.cover.formats.thumbnail.url;
      const isSaved = savedBooks.includes(book.id);

      let bookDiv = document.createElement("div");
      bookDiv.className = "book-item";
      bookDiv.dataset.id = book.id;
      let stars = book.bookRatings?.map((rating) => rating.rating) || [];
      let averageRating = 0;
      if (stars.length > 0) {
        let sum = 0;
        for (let i = 0; i < stars.length; i++) {
          sum += stars[i];
        }
        let average = sum / stars.length;
        averageRating = Math.round(average);
      }
      bookDiv.innerHTML = ` 
       <div class="heart-container">
          ${
            token
              ? `<i class="fa-${
                  isSaved ? "solid" : "regular"
                } fa-heart" title="Save to favorites"></i>`
              : ""
          }
        </div>
        ${
          coverUrl
            ? `<img src="${BASE_URL}${coverUrl}" alt="${book.title} cover" width="100px" />`
            : "<p>No image</p>"
        }
        <h3 class="book-name">${book.title}</h3>
        <h4 class="book-author">${book.author}</h4>
        <p class="book-release-date">Date of Release: ${book.release_date}</p>
        <p class="book-length">${book.length} pages</p>
        <p class="book-rating">Rating: ${book.rating ?? ""}
          <span class="stars" data-id="${book.id}">
            ${[1, 2, 3, 4, 5]
              .map(
                (value) =>
                  `<i class="fa-${
                    value <= averageRating ? "solid" : "regular"
                  } fa-star" data-value="${value}"></i>`
              )
              .join("")}
          </span>
        </p>
        <p class="book-price"> Price: ${book.price}kr</p>
        <button class="buy-button">Buy</button>`;
      booksList.appendChild(bookDiv);
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    alert("Failed to load books.");
  }
}

async function renderProfile() {
  const user = await getMe();
  if (!user) return;

  const profileContainer = document.querySelector(".container-main");
  profileContainer.innerHTML = `
    <div class="profile-columns">
      <div class="saved-books-column">
        <h3>Saved books</h3> 
        <div class="sort-container">
          <select id="sort-saved">
            <option value="">Sort by</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="author_asc">Author (A-Z)</option>
            <option value="author_desc">Author (Z-A)</option>
            <option value="rating_desc">Rating (High-Low)</option>
            <option value="rating_asc">Rating (Low-High)</option>
          </select>
        </div>
        <ul id="saved-books-list" class="books-list"></ul>
      </div>
      <div class="rated-books-column">
        <h3>My book ratings</h3>
        <div class="sort-container">
          <select id="sort-ratings">
            <option value="">Sort by</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="rating_desc">Rating (High-Low)</option>
            <option value="rating_asc">Rating (Low-High)</option>
          </select>
        </div>
        <ul id="ratings-books-list" class="ratings-list"></ul>
      </div>
    </div>
  `;

  const bookList = document.querySelector("#saved-books-list");
  const ratingsBookList = document.querySelector("#ratings-books-list");

  if (!user.bookRatings || user.bookRatings.length === 0) {
    ratingsBookList.innerHTML =
      "<p class='empty-list-message'>You haven't rated any books yet</p>";
  } else {
    for (const userBookRating of user.bookRatings) {
      const rating = await getBookRating(userBookRating.id);
      if (!rating) continue;

      const bookData = rating.book;
      const bookItem = document.createElement("li");

      bookItem.dataset.id = bookData.id;
      bookItem.dataset.title = bookData.title;
      bookItem.dataset.author = bookData.author;
      bookItem.dataset.rating = rating.rating;
      bookItem.className = "rating-list-item";

      let starsHtml = "";
      for (let i = 1; i <= 5; i++) {
        starsHtml += `<i class="fa-${
          i <= rating.rating ? "solid" : "regular"
        } fa-star"></i>`;
      }

      bookItem.innerHTML = `
      <span class="book-title">${bookData.title}</span>
      <span class="book-rating">${rating.rating}/5</span>
    `;

      ratingsBookList.appendChild(bookItem);
    }
  }

  user.savedBooks.forEach(async (book) => {
    if (!user.savedBooks || user.savedBooks.length === 0) {
      bookList.innerHTML = "<p>No saved books</p>";
      return;
    }
    let bookObject = await getBook(book.id);

    const bookDiv = document.createElement("li");
    bookDiv.className = "book-item";
    bookDiv.dataset.id = bookObject.id;
    bookDiv.dataset.title = bookObject.title;
    bookDiv.dataset.author = bookObject.author;

    let stars = bookObject.bookRatings?.map((rating) => rating.rating) || [];
    let averageRating =
      stars.length > 0
        ? Math.round(
            stars.reduce((acc, rating) => acc + rating, 0) / stars.length
          )
        : 0;

    let coverUrl = "";
    try {
      coverUrl = bookObject.cover.formats.thumbnail.url;
      if (!coverUrl) {
        coverUrl = bookObject.cover.url;
      }
    } catch (error) {
      console.error("Error fetching book cover:", error);
    }

    bookDiv.innerHTML = `
    <div class="heart-container">
      <i class="fa-solid fa-heart" title="Saved"></i>
    </div>
    ${
      coverUrl
        ? `<img src="${BASE_URL}${coverUrl}" alt="${bookObject.title} cover" width="100px" />`
        : "<p>No image</p>"
    }
      <h3 class="book-name">${bookObject.title}</h3>
      <h4 class="book-author">${bookObject.author}</h4>
      <p class="book-rating">Rating:
         <span class="stars" data-id="${bookObject.id}">
          ${[1, 2, 3, 4, 5]
            .map(
              (value) =>
                `<i class="fa-${
                  value <= averageRating ? "solid" : "regular"
                } fa-star" data-value="${value}"></i>`
            )
            .join("")}
        </span>
      </p>
      <button class="buy-button" data-id="${bookObject.id}">Buy</button>
    `;
    bookList.appendChild(bookDiv);
  });

  document.querySelector("#sort-saved").addEventListener("change", (e) => {
    const sortBy = e.target.value;
    const listItems = Array.from(bookList.children);

    if (!sortBy) return;

    const [field, direction] = sortBy.split("_");
    const isAsc = direction === "asc";

    listItems.sort((a, b) => {
      if (field === "rating") {
        const starsA = a.querySelector(".stars");
        const starsB = b.querySelector(".stars");

        const ratingA = starsA ? countSolidStars(starsA) : 0;
        const ratingB = starsB ? countSolidStars(starsB) : 0;

        return isAsc ? ratingA - ratingB : ratingB - ratingA;
      } else {
        const textA = a.dataset[field].toLowerCase();
        const textB = b.dataset[field].toLowerCase();
        return isAsc ? textA.localeCompare(textB) : textB.localeCompare(textA);
      }
    });

    bookList.innerHTML = "";
    listItems.forEach((item) => bookList.appendChild(item));
  });

  document.querySelector("#sort-ratings").addEventListener("change", (e) => {
    const sortBy = e.target.value;
    const listItems = Array.from(ratingsBookList.children);

    if (!sortBy) return;

    const [field, direction] = sortBy.split("_");
    const isAsc = direction === "asc";

    listItems.sort((a, b) => {
      if (field === "rating") {
        const ratingA = parseInt(a.dataset.rating) || 0;
        const ratingB = parseInt(b.dataset.rating) || 0;

        return isAsc ? ratingA - ratingB : ratingB - ratingA;
      } else {
        const textA = a.dataset[field].toLowerCase();
        const textB = b.dataset[field].toLowerCase();
        return isAsc ? textA.localeCompare(textB) : textB.localeCompare(textA);
      }
    });

    ratingsBookList.innerHTML = "";
    listItems.forEach((item) => ratingsBookList.appendChild(item));
  });

  document.querySelectorAll(".fa-heart").forEach((heartIcon) => {
    heartIcon.addEventListener("click", async (e) => {
      const bookItem = e.target.closest(".book-item");
      const bookId = parseInt(bookitem.dataset.id);

      try {
        await removeSavedBooks(user.id, bookId);
        bookitem.style.opacity = "0";
        setTimeout(() => {
          bookItem.remove();
        }, 500);
      } catch (error) {
        console.error("Error removing book from reading list:", error);
        alert("Failed to remove book from your reading list.");
      }
    });
  });

  document.querySelectorAll(".stars i").forEach((star) => {
    star.addEventListener("click", async (e) => {
      const rating = parseInt(e.target.dataset.value);
      const bookId = parseInt(e.target.closest(".stars").dataset.id);
      const token = getToken();

      if (!token) {
        alert("Please log in to rate a book.");
        return;
      }

      try {
        const userData = await getMe();

        if (!userData) {
          alert("Unable to retrieve user information.");
          return;
        }

        await axios.post(
          `${BASE_URL}/api/book-ratings`,
          {
            data: {
              rating: rating,
              book: {
                id: bookId,
              },
              users_permissions_user: userData.id,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const starsContainer = e.target.closest(".stars");
        starsContainer.querySelectorAll("i").forEach((star, index) => {
          if (index < rating) {
            star.classList.remove("fa-regular");
            star.classList.add("fa-solid");
          } else {
            star.classList.remove("fa-solid");
            star.classList.add("fa-regular");
          }
        });
      } catch (error) {
        console.error("Error submitting rating:", error);
        alert("Failed to submit rating.");
      }
    });
  });
}

function backToBooks(userData) {
  if (!userData) {
    return;
  }
  if (!document.querySelector(".book-icon-container")) {
    const bookIconContainer = document.createElement("div");
    bookIconContainer.className = "book-icon-container";

    const bookIcon = document.createElement("i");
    bookIcon.className = "fa-solid fa-book book-icon fa-xl theme-icon";

    const bookText = document.createElement("span");
    bookText.textContent = "All Books";
    bookText.className = "book-text";

    bookIconContainer.appendChild(bookIcon);
    bookIconContainer.appendChild(bookText);

    const loginSection = loginText.parentElement;
    loginSection.appendChild(bookIconContainer);

    bookIconContainer.addEventListener("click", () => {
      const isProflie = document.querySelector("#saved-books-list");
      if (isProflie) {
        const profileContainer = document.querySelector(".container-main");
        profileContainer.innerHTML = `
              <div id="welcome-message" class="welcome-message"></div>
              <div class="book-list" id="book-list"></div>
            `;
        setWelcome(userData.username);
        renderBooks();
      } else {
        renderProfile();
      }
    });
  }
}

//-----------------Start and heart function------------------

async function getBookRating(bookRatingId) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    alert("Please log in to view book details.");
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/api/book-ratings?filters[id][$eq]=${bookRatingId}&populate=*`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

async function getBook(bookId) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    alert("Please log in to view book details.");
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/api/books?filters[id][$eq]=${bookId}&populate=*`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    } else {
      console.error("Book not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

async function addSavedBooks(userId, bookIds) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    alert("Please log in to save books.");
    return null;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/users/${userId}`,
      {
        savedBooks: {
          connect: Array.isArray(bookIds) ? bookIds : [bookIds],
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding saved books:", error);
    alert("Failed to save books.");
    return null;
  }
}

async function removeSavedBooks(userId, bookIds) {
  const token = localStorage.getItem("jwt");
  if (!token) {
    alert("Please log in to remove saved books.");
    return null;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/users/${userId}`,
      {
        savedBooks: {
          disconnect: Array.isArray(bookIds) ? bookIds : [bookIds],
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (document.querySelector("#saved-books-list")) {
      renderProfile();
    }

    return response.data;
  } catch (error) {
    console.error("Error removing saved books:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await changeTheme();
  const token = getToken();
  if (token) {
    try {
      const userData = await getMe();
      if (userData) {
        handleLogin(userData);
      } else {
        localStorage.removeItem("jwt");
        loginText.innerHTML = "Login";
        renderBooks();
      }
    } catch (error) {
      console.error("Error validating token:", error);
      localStorage.removeItem("jwt");
      loginText.innerHTML = "Login";
      renderBooks();
    }
  } else {
    loginText.innerHTML = "Login";
    renderBooks();
  }
});
renderBooks();
