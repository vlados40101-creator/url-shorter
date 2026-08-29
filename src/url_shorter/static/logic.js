const baseUrl = "http://localhost:8000"

// Функция для получения всех ссылок
async function getAllLinks() {
  try {
    const response = await fetch(`${baseUrl}/links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) throw new Error('Failed to get links');
    const data = await response.json();
    console.log('All links:', data);
    return data;

  } catch (error) {
    console.error('Error fetching links:', error);
    return null;
  }
}

async function createLink(long) {
  const data = {"link": long}
  try {
    const params = new URLSearchParams(data);
    const response = await fetch(`${baseUrl}/link?${params.toString()}`, {
        method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to create link!!!!!');
    const code = await response.text();
    console.log('Link created:', code);
    return code;

  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}

async function deleteLink(short) {
  const data = {"code": short}
  try {
    const params = new URLSearchParams(data);
    const response = await fetch(`${baseUrl}/link?${params.toString()}`, {
        method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete link!!!!!');
    console.log('Link deleted:', short);
    return true;

  } catch (error) {
      console.error('Error:', error);
      return false;
  }
}

// Функция для отображения всех ссылок в таблице
function renderAllLinks(links) {
    const tbody = document.querySelector('#linksTable tbody');
    tbody.innerHTML = ''; // Очищаем таблицу
    
    // Проверяем, что links это объект и не пустой
    if (!links || typeof links !== 'object' || Object.keys(links).length === 0) {
        // Показываем сообщение, если ссылок нет
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" style="text-align: center; padding: 20px;">
                No links found. Create your first link!
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    // Проходим по объекту, где ключ - это код, значение - URL
    for (const [code, url] of Object.entries(links)) {
        addRowToTable(code, url);
    }
}

// Функция для добавления строки в таблицу
function addRowToTable(code, longUrl) {
    const tbody = document.querySelector('#linksTable tbody');
    
    // Удаляем сообщение "No links found" если оно есть
    const noLinksMsg = tbody.querySelector('td[colspan="3"]');
    if (noLinksMsg) {
        tbody.innerHTML = '';
    }
    
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td class="center">
            <span class="block code">${code}</span>
        </td>
        <td>
            <span class="block"><a href="${longUrl}" target="_blank">${longUrl}</a></span>
        </td>
        <td class="center">
            <button class="action delete" data-code="${code}">Delete</button>
        </td>
    `;
    
    tbody.appendChild(newRow);
}

// Функция для удаления строки из таблицы
function removeRowFromTable(code) {
    const rows = document.querySelectorAll('#linksTable tbody tr');
    for (const row of rows) {
        const deleteBtn = row.querySelector('.delete');
        if (deleteBtn && deleteBtn.dataset.code === code) {
            row.remove();
            return true;
        }
    }
    return false;
}

// Функция для обновления таблицы (перезагрузка всех ссылок)
async function refreshLinks() {
    const links = await getAllLinks();
    if (links) {
        renderAllLinks(links);
    }
}

// Обработка формы создания ссылки
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createLinkForm');
    const urlInput = document.getElementById('urlInput');
    
    // Загружаем все ссылки при загрузке страницы
    refreshLinks();
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const longUrl = urlInput.value.trim();
        if (!longUrl) {
            alert('Please enter a valid URL');
            return;
        }
        
        // Проверяем, что URL начинается с http:// или https://
        let finalUrl = longUrl;
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        
        const code = await createLink(finalUrl);
        if (code) {
            addRowToTable(code, finalUrl);
            urlInput.value = '';
        }
    });
});

// Обработка кликов по кнопкам Delete
const table = document.getElementById('linksTable'); 
table.addEventListener('click', async function(event) {
    const classlist = event.target.classList;
    
    if (classlist.contains('delete')) {
        const code = event.target.dataset.code;
        if (!code) {
            console.error('No code found for delete button');
            return;
        }
        
        if (confirm(`Are you sure you want to delete link with code: ${code}?`)) {
            const success = await deleteLink(code);
            if (success) {
                removeRowFromTable(code);
            }
        }
    }
});