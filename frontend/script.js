const openModal = document.querySelector("#open-modal-btn");
const closeModal = document.querySelector(".close-modal-btn");
const loginModal = document.querySelector("#login-modal");

const BASE_URL = "http://localhost:1337";

const renderBooks = async () => {
  let response = await axios.get(`${BASE_URL}/api/books?populate=*`);
  let books = response.data.data;

  let bookList = document.querySelector(".book-list");
  bookList.innerHTML = "";

  books.forEach((book) => {
    let coverUrl = book.cover.formats.thumbnail.url;

    let div = document.createElement("div");
    div.className = "book-item";
    div.innerHTML = `
    ${
      coverUrl
        ? `<img src="${BASE_URL}${coverUrl}" alt="${book.title} cover" width="100px" />`
        : "<p>Ingen bild</p>"
    }
      <h3 class="book-name">${book.title}</h3>
      <h4 class="book-author">${book.author}</h4>
      <p class="book-release-date">Date of Release: ${book.release_date}</p>
      <p class="book-length">${book.length} pages</p>
      <p class="book-rating">Rating: ${book.rating ?? ""}
        <span class="stars" id="stars">
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
};

openModal.addEventListener("click", () => {
  showModal(loginModal);
});

closeModal.addEventListener("click", () => {
  hideModal(loginModal);
});

function showModal(modal) {
  modal?.classList.add("show");
  modal?.classList.remove("hide");
}

function hideModal(modal) {
  modal?.classList.remove("show");
  modal?.classList.add("hide");
}

async function login() {
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  try {
    let response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: username,
      password: password,
    });
    const token = response.data.jwt;
    alert("Login successful!");
    localStorage.setItem("jwt", token);
    hideModal(loginModal);
    console.log(response.data);
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Login failed.");
  }
}

renderBooks();
