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
    <div class="pagination" id="pagination"></div> <!-- Додано пагінацію -->
  </div>
`;

const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('resultsList');
const pagination = document.getElementById('pagination');

const itemsPerPage = 10;
let currentPage = 1;
let filteredData = [];

// Функція для виділення тексту
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// Функція для оновлення пагінації
function updatePagination(totalPages) {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const createPageButton = (page) => {
    const button = document.createElement('button');
    button.textContent = page;
    button.classList.toggle('active', page === currentPage);
    button.style.backgroundColor = page === currentPage ? '#ff4aed' : '#ff4aed00'; // Стиль для активної та неактивної сторінки
    button.style.color = '#ffffff'; // Білий колір цифр
    button.style.fontSize = '18px'; // Збільшений розмір шрифту
    button.style.border = 'none'; // Без бордерів
    button.addEventListener('click', () => {
      currentPage = page;
      displayResults(searchInput.value.trim().toLowerCase());
    });
    return button;
  };

  // Кнопки сторінок
  if (currentPage > 3) pagination.appendChild(createPageButton(1));
  if (currentPage > 3) pagination.appendChild(document.createTextNode(' ... '));

  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pagination.appendChild(createPageButton(i));
  }

  if (currentPage < totalPages - 2) pagination.appendChild(document.createTextNode(' ... '));

  if (currentPage !== totalPages) {
    pagination.appendChild(createPageButton(totalPages));
  }
}

// Групування пісень за виконавцями
function displayResults(query) {
  resultsList.innerHTML = '';

  if (query.trim()) {
    // Якщо є запит пошуку, не показуємо пагінацію
    pagination.style.display = 'none';

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

      // Відображаємо виконавців та їх пісні
      Object.keys(groupedResults).forEach((artist) => {
        const li = document.createElement('li');
        li.classList.add('artist');
        li.innerHTML = `<strong>${highlightText(artist, query)}</strong>`;
        
        const ul = document.createElement('ul');
        ul.classList.add('songs-list');
        ul.style.maxHeight = '0'; // Спочатку приховуємо список

        groupedResults[artist].forEach((title) => {
          const songLi = document.createElement('li');
          songLi.innerHTML = highlightText(title, query);
          ul.appendChild(songLi);
        });

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

        // Автоматично відкриваємо список, якщо знайдена пісня
        if (query) {
          const songsList = li.querySelector('.songs-list');
          songsList.style.maxHeight = songsList.scrollHeight + 'px'; // Відкриваємо список
        }
      });
    } else {
      resultsList.innerHTML = '<li>Не знайдено результатів</li>';
    }
  } else {
    // Якщо запит порожній, показуємо всі результати з пагінацією
    pagination.style.display = 'block';

    filteredData = data;
    const groupedResults = {};
    filteredData.forEach(({ title, artist }) => {
      if (!groupedResults[artist]) {
        groupedResults[artist] = [];
      }
      groupedResults[artist].push(title);
    });

    const artistsList = Object.keys(groupedResults);
    const totalPages = Math.ceil(artistsList.length / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages) || 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentArtists = artistsList.slice(start, end);

    currentArtists.forEach((artist) => {
      const li = document.createElement('li');
      li.classList.add('artist');
      li.innerHTML = `<strong>${highlightText(artist, '')}</strong>`;
      const ul = document.createElement('ul');
      ul.classList.add('songs-list');
      ul.style.maxHeight = '0'; // Спочатку приховуємо список

      groupedResults[artist].forEach((title) => {
        const songLi = document.createElement('li');
        songLi.innerHTML = highlightText(title, '');
        ul.appendChild(songLi);
      });

      li.appendChild(ul);
      resultsList.appendChild(li);

      li.addEventListener('click', () => {
        const songsList = li.querySelector('.songs-list');
        if (songsList.style.maxHeight === '0px') {
          songsList.style.maxHeight = songsList.scrollHeight + 'px';
        } else {
          songsList.style.maxHeight = '0';
        }
      });
    });

    updatePagination(totalPages);
  }
}

// Оновлення результатів під час введення
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  currentPage = 1; // Скидаємо сторінку на 1 при новому пошуку
  displayResults(query);
});

// Початкове відображення
displayResults('');
