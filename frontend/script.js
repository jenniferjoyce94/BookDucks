// const BASE_URL = "http://localhost:1337";

// let getData = async () => {
//   let response = await fetch();
//   let data = await response.json();
//   return data;
// };
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
      <h3 class="book-name">${book.title}</h3>
      <p class="book-author">Author: ${book.author}</p>
      <p class="book-length">Length:${book.length} sidor</p>
      ${
        coverUrl
          ? `<img src="${BASE_URL}${coverUrl}" alt="${book.title} cover" width="100px" />`
          : "<p>Ingen bild</p>"
      }
      <pclass="book-release-date">Date of Release: ${book.release_date}</p>
      <p class="book-rating">Rating: ${book.rating ?? ""}</p>
      `;
    bookList.appendChild(div);
  });
};

renderBooks();
