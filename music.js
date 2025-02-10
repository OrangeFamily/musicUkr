import data from './songs_data.js';

// Структура для відображення
const app = document.getElementById('app');

app.innerHTML = `
  <div class="search-page">
    <header>
      <h1>Пошук пісень та виконавців</h1>
    </header>
    <div class="search-bar">
      <input id="searchInput" type="text" placeholder="Шукати пісню або виконавця..." />
    </div>
    <div class="results">
      <ul id="resultsList"></ul>
    </div>
    <div class="pagination">
      <button id="prevPage" disabled>Назад</button>
      <button id="nextPage">Вперед</button>
    </div>
  </div>
`;

const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('resultsList');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');

const itemsPerPage = 10; // Кількість виконавців на одній сторінці
let currentPage = 1; // Поточна сторінка
let filteredData = []; // Массив відфільтрованих пісень

// Функція для виділення тексту
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// Групування пісень за виконавцями з фільтрацією пісень
function displayResults(query) {
  resultsList.innerHTML = '';
  filteredData = data.filter(
    ({ title, artist }) =>
      title.toLowerCase().includes(query) || artist.toLowerCase().includes(query)
  );

  if (filteredData.length > 0) {
    const groupedResults = {};

    // Групуємо пісні за виконавцями
    filteredData.forEach(({ title, artist }) => {
      if (!groupedResults[artist]) {
        groupedResults[artist] = [];
      }
      groupedResults[artist].push(title);
    });

    const artistsList = Object.keys(groupedResults);
    const totalPages = Math.ceil(artistsList.length / itemsPerPage);

    // Відображення виконавців на поточній сторінці
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentArtists = artistsList.slice(start, end);

    // Відображаємо виконавців та пісні з співпадіннями
    currentArtists.forEach((artist) => {
      const li = document.createElement('li');
      li.classList.add('artist');
      li.innerHTML = `<strong>${highlightText(artist, query)}</strong>`;

      const ul = document.createElement('ul');
      ul.classList.add('songs-list');
      ul.style.maxHeight = '0'; // Спочатку приховуємо список (закритий стан)

      let hasMatch = false; // Для перевірки, чи є співпадіння в піснях

      groupedResults[artist].forEach((title) => {
        // Якщо пісня має співпадіння, підсвічуємо її
        if (title.toLowerCase().includes(query)) {
          hasMatch = true;
          const songLi = document.createElement('li');
          songLi.innerHTML = highlightText(title, query);
          ul.appendChild(songLi);
        }
      });

      if (ul.children.length > 0) {
        li.appendChild(ul);
        resultsList.appendChild(li);

        // Додаємо обробник події для розкриття списку
        li.addEventListener('click', () => {
          const songsList = li.querySelector('.songs-list');
          // Перемикаємо анімацію для відкриття/закриття
          if (songsList.style.maxHeight === '0px') {
            songsList.style.maxHeight = songsList.scrollHeight + 'px'; // Встановлюємо висоту для анімації
          } else {
            songsList.style.maxHeight = '0'; // Сховуємо список
          }
        });

        // Якщо є співпадіння, автоматично відкриваємо акордеон
        if (hasMatch) {
          const songsList = li.querySelector('.songs-list');
          songsList.style.maxHeight = songsList.scrollHeight + 'px'; // Відкриваємо список
        }
      }
    });

    // Оновлюємо кнопки пагінації
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  } else {
    resultsList.innerHTML = '<li>Не знайдено результатів</li>';
  }
}

// Обробники подій для пагінації
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayResults(searchInput.value.trim().toLowerCase());
  }
});

nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayResults(searchInput.value.trim().toLowerCase());
  }
});

// Ініціалізація
displayResults('');

// Оновлення результатів під час введення
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  currentPage = 1; // Скидаємо на першу сторінку при зміні запиту
  displayResults(query);
});
