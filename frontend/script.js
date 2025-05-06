const BASE_URL = "http://localhost:1337";

let getData = async (url) => {
  let response = await fetch(url);
  let data = await response.json();
  console.log(data);
  return data;
};

const renderBooks = async () => {
  let books = await getData(`${BASE_URL}/api/books?populate=*`);

  let bookList = document.querySelector(".book-list");
  bookList.innerHTML = "";

  books.data.forEach((data) => {
    let attributes = data.attributes;

    let coverUrl = attributes.cover?.data?.attributes?.url
      ? `${BASE_URL}${attributes.cover.data.attributes.url}`
      : "images/placeholder.jpg";

    let li = document.createElement("li");
    li.className = "book-item";
    li.innerHTML = `
        <h3>${attributes.title}</h3>
        <p>${data.author}</p>
        <p>${data.length}</p>
        <p>${data.release_date}</p>
        <img src="${coverUrl}" alt="${data.title} cover" />
        <p>${data.rating}</p>
        <button class="delete" data-id="${data.id}">Delete</button>
        `;
    bookList.appendChild(li);
  });
};

renderBooks();
