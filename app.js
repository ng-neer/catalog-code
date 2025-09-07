// Данные приложения
let items = [];
let filteredItems = [];
let currentEditingId = null;
let currentViewingId = null;
let nextId = 1;
let currentSort = { column: null, direction: 'asc' };
let isCompactView = false; // Состояние компактного вида

// Предустановленные данные
const CONDITIONS = ["Новый", "Отличное", "Хорошее", "Удовлетворительное", "Плохое", "Витринный образец", "Восстановленный", "Б/у"];
const CATEGORIES = ["Мебель", "Текстиль", "Посуда и кухня", "Бытовая техника", "Электроника", "Хозяйственные товары", "Декор", "Одежда", "Обувь", "Книги", "Канцелярия", "Ванная", "Инструменты", "Сад и дача", "Спорт", "Игрушки", "Автотовары", "Другое"];

// Примерные данные
const SAMPLE_ITEMS = [
    {
        id: 1,
        name: "Кофемашина DeLonghi",
        description: "Автоматическая кофемашина с капучинатором",
        purchaseDate: "2023-05-15",
        website: "https://delonghi.com",
        photos: ["https://via.placeholder.com/300x200?text=Кофемашина"],
        mainPhoto: 0,
        purchasePrice: 35000,
        sellPrice: null,
        condition: "Отличное",
        conditionComment: "Практически не использовалась",
        category: "Бытовая техника",
        tags: ["кофе", "кухня", "автомат"],
        manufacturer: "DeLonghi",
        material: "Пластик, металл",
        dimensions: "35x25x40 см",
        weight: "4.5 кг",
        color: "Черный",
        model: "ECAM 22.110",
        warrantyPeriod: "2 года",
        completeness: "Полная",
        purchaseLocation: "М.Видео",
        countryOfOrigin: "Италия",
        notes: "Куплена по акции"
    },
    {
        id: 2,
        name: "Диван угловой",
        description: "Большой угловой диван из натуральной кожи",
        purchaseDate: "2022-12-01",
        website: "https://furniture.com",
        photos: ["https://via.placeholder.com/300x200?text=Диван"],
        mainPhoto: 0,
        purchasePrice: 85000,
        sellPrice: 65000,
        condition: "Хорошее",
        conditionComment: "Небольшие потертости",
        category: "Мебель",
        tags: ["диван", "кожа", "угловой"],
        manufacturer: "LazyBoy",
        material: "Натуральная кожа",
        dimensions: "280x200x90 см",
        weight: "65 кг",
        color: "Коричневый",
        model: "LB-2022",
        warrantyPeriod: "5 лет",
        completeness: "Полная",
        purchaseLocation: "Гранд Мебель",
        countryOfOrigin: "Италия",
        notes: "Очень удобный"
    },
    {
        id: 3,
        name: "iPhone 14 Pro",
        description: "Смартфон Apple iPhone 14 Pro 256GB",
        purchaseDate: "2024-01-20",
        website: "https://apple.com",
        photos: ["https://via.placeholder.com/300x200?text=iPhone"],
        mainPhoto: 0,
        purchasePrice: 120000,
        sellPrice: null,
        condition: "Новый",
        conditionComment: "В заводской пленке",
        category: "Электроника",
        tags: ["смартфон", "apple", "телефон"],
        manufacturer: "Apple",
        material: "Алюминий, стекло",
        dimensions: "147.5x71.5x7.85 мм",
        weight: "206 г",
        color: "Фиолетовый",
        model: "A2890",
        warrantyPeriod: "1 год",
        completeness: "Полная с документами",
        purchaseLocation: "re:Store",
        countryOfOrigin: "Китай",
        notes: "Подарок на день рождения"
    }
];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing app...');
    initializeApp();
    setupEventListeners();
    loadData();
    populateFilters();
    applyFilters();
    // Инициализация компактного вида после отрисовки таблицы
    setTimeout(() => {
        initializeCompactView();
    }, 100);
});

// Инициализация приложения
function initializeApp() {
    try {
        const savedItems = localStorage.getItem('catalogItems');
        if (!savedItems || JSON.parse(savedItems).length === 0) {
            items = [...SAMPLE_ITEMS];
            nextId = Math.max(...items.map(item => item.id), 0) + 1;
            saveData();
            console.log('Sample data loaded:', items.length, 'items');
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        items = [...SAMPLE_ITEMS];
        nextId = 4;
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Кнопки заголовка
    const addBtn = document.getElementById('addItemBtn');
    if (addBtn) addBtn.addEventListener('click', openAddItemModal);
    
    const importBtn = document.getElementById('importBtn');
    if (importBtn) importBtn.addEventListener('click', importData);
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    
    const statsBtn = document.getElementById('statsBtn');
    if (statsBtn) statsBtn.addEventListener('click', openStatsModal);
    
    // Кнопка переключения компактного вида
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    if (toggleViewBtn) toggleViewBtn.addEventListener('click', toggleCompactView);

    // Поиск и фильтры с мгновенным применением
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    
    const priceFromFilter = document.getElementById('priceFromFilter');
    if (priceFromFilter) priceFromFilter.addEventListener('input', debounce(applyFilters, 500));
    
    const priceToFilter = document.getElementById('priceToFilter');
    if (priceToFilter) priceToFilter.addEventListener('input', debounce(applyFilters, 500));
    
    const dateFromFilter = document.getElementById('dateFromFilter');
    if (dateFromFilter) dateFromFilter.addEventListener('change', applyFilters);
    
    const dateToFilter = document.getElementById('dateToFilter');
    if (dateToFilter) dateToFilter.addEventListener('change', applyFilters);
    
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

    // Сортировка таблицы
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => handleSort(th.dataset.column));
    });

    // Форма добавления/редактирования
    const itemForm = document.getElementById('itemForm');
    if (itemForm) itemForm.addEventListener('submit', handleFormSubmit);

    // Кнопки в модальном окне просмотра
    const editItemBtn = document.getElementById('editItemBtn');
    if (editItemBtn) editItemBtn.addEventListener('click', editCurrentItem);
    
    const deleteItemBtn = document.getElementById('deleteItemBtn');
    if (deleteItemBtn) deleteItemBtn.addEventListener('click', deleteCurrentItem);

    // Импорт файла
    const importInput = document.getElementById('importInput');
    if (importInput) importInput.addEventListener('change', handleImportFile);
    
    // Закрытие меню при клике вне их
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.action-menu-container')) {
            closeAllActionMenus();
        }
    });
    
    // Закрытие меню при прокрутке
    window.addEventListener('scroll', closeAllActionMenus);
    window.addEventListener('resize', closeAllActionMenus);
}

// Загрузка данных из localStorage
function loadData() {
    try {
        const savedItems = localStorage.getItem('catalogItems');
        if (savedItems) {
            items = JSON.parse(savedItems);
            nextId = Math.max(...items.map(item => item.id || 0), 0) + 1;
            console.log('Data loaded from localStorage:', items.length, 'items');
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Сохранение данных в localStorage
function saveData() {
    try {
        localStorage.setItem('catalogItems', JSON.stringify(items));
        console.log('Data saved to localStorage');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Заполнение фильтров
function populateFilters() {
    console.log('Populating filters...');
    populateSelect('itemCategory', CATEGORIES);
    populateSelect('itemCondition', CONDITIONS);
    
    // Создание чекбоксов для категорий
    populateCheckboxFilters('categoryFilters', CATEGORIES, 'category');
    
    // Создание чекбоксов для состояний
    populateCheckboxFilters('conditionFilters', CONDITIONS, 'condition');
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите...</option>';
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

function populateCheckboxFilters(containerId, options, filterType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    options.forEach(option => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${filterType}-${option}`;
        checkbox.value = option;
        checkbox.addEventListener('change', applyFilters);
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option;
        
        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        container.appendChild(checkboxItem);
    });
}

// Получение выбранных значений чекбоксов
function getSelectedCheckboxValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Сортировка таблицы
function handleSort(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    updateSortIndicators();
    applyFilters();
}

function updateSortIndicators() {
    // Сброс всех индикаторов
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.className = 'sort-indicator';
    });
    
    // Установка активного индикатора
    if (currentSort.column) {
        const activeHeader = document.querySelector(`[data-column="${currentSort.column}"] .sort-indicator`);
        if (activeHeader) {
            activeHeader.className = `sort-indicator ${currentSort.direction}`;
        }
    }
}

// Применение фильтров и сортировки
function applyFilters() {
    console.log('Applying filters...');
    filteredItems = [...items];
    
    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => {
                const searchFields = [
                    item.name || '',
                    item.description || '',
                    item.manufacturer || '',
                    (item.tags || []).join(' ')
                ].join(' ').toLowerCase();
                return searchFields.includes(searchTerm);
            });
        }
    }
    
    // Фильтр по категориям (мультивыбор)
    const selectedCategories = getSelectedCheckboxValues('categoryFilters');
    if (selectedCategories.length > 0) {
        filteredItems = filteredItems.filter(item => 
            selectedCategories.includes(item.category)
        );
    }
    
    // Фильтр по состояниям (мультивыбор)
    const selectedConditions = getSelectedCheckboxValues('conditionFilters');
    if (selectedConditions.length > 0) {
        filteredItems = filteredItems.filter(item => 
            selectedConditions.includes(item.condition)
        );
    }
    
    // Фильтр по цене
    const priceFromEl = document.getElementById('priceFromFilter');
    const priceToEl = document.getElementById('priceToFilter');
    
    if (priceFromEl || priceToEl) {
        const priceFrom = priceFromEl ? parseFloat(priceFromEl.value) || 0 : 0;
        const priceTo = priceToEl ? parseFloat(priceToEl.value) || Infinity : Infinity;
        
        filteredItems = filteredItems.filter(item => {
            const price = item.purchasePrice || 0;
            return price >= priceFrom && price <= priceTo;
        });
    }
    
    // Фильтр по дате покупки
    const dateFromEl = document.getElementById('dateFromFilter');
    const dateToEl = document.getElementById('dateToFilter');
    
    if (dateFromEl || dateToEl) {
        const dateFrom = dateFromEl ? dateFromEl.value : '';
        const dateTo = dateToEl ? dateToEl.value : '';
        
        if (dateFrom || dateTo) {
            filteredItems = filteredItems.filter(item => {
                if (!item.purchaseDate) return false;
                
                const itemDate = new Date(item.purchaseDate);
                let isValid = true;
                
                if (dateFrom) {
                    const fromDate = new Date(dateFrom);
                    isValid = isValid && itemDate >= fromDate;
                }
                
                if (dateTo) {
                    const toDate = new Date(dateTo);
                    isValid = isValid && itemDate <= toDate;
                }
                
                return isValid;
            });
        }
    }
    
    // Сортировка
    if (currentSort.column) {
        filteredItems.sort((a, b) => {
            let valueA, valueB;
            
            switch (currentSort.column) {
                case 'name':
                    valueA = (a.name || '').toLowerCase();
                    valueB = (b.name || '').toLowerCase();
                    break;
                case 'category':
                    valueA = (a.category || '').toLowerCase();
                    valueB = (b.category || '').toLowerCase();
                    break;
                case 'condition':
                    valueA = (a.condition || '').toLowerCase();
                    valueB = (b.condition || '').toLowerCase();
                    break;
                case 'purchasePrice':
                    valueA = a.purchasePrice || 0;
                    valueB = b.purchasePrice || 0;
                    break;
                case 'sellPrice':
                    valueA = a.sellPrice || 0;
                    valueB = b.sellPrice || 0;
                    break;
                case 'purchaseDate':
                    valueA = new Date(a.purchaseDate || 0);
                    valueB = new Date(b.purchaseDate || 0);
                    break;
                default:
                    return 0;
            }
            
            let comparison = 0;
            if (valueA > valueB) comparison = 1;
            if (valueA < valueB) comparison = -1;
            
            return currentSort.direction === 'desc' ? -comparison : comparison;
        });
    }
    
    renderTable();
    updateStats();
}

// Отображение таблицы
function renderTable() {
    console.log('Rendering table with', filteredItems.length, 'items');
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tableBody || !emptyState) {
        console.error('Table elements not found');
        return;
    }
    
    if (!filteredItems || filteredItems.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    
    tableBody.innerHTML = filteredItems.map(item => {
        const mainPhotoUrl = item.photos && item.photos.length > 0 ? item.photos[item.mainPhoto || 0] : null;
        const conditionClass = getConditionClass(item.condition);
        
        return `
            <tr class="table-row-clickable" data-item-id="${item.id}" style="cursor: pointer;">
                <td class="photo-column">
                    <div class="item-photo" ${mainPhotoUrl ? `style="background-image: url('${mainPhotoUrl}')"` : ''}>
                        ${mainPhotoUrl ? '' : 'Нет фото'}
                    </div>
                </td>
                <td>
                    <div class="item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
                </td>
                <td>
                    <span class="item-category">${escapeHtml(item.category || 'Без категории')}</span>
                </td>
                <td>
                    <span class="item-condition ${conditionClass}">${escapeHtml(item.condition || 'Не указано')}</span>
                </td>
                <td>
                    <span class="item-price">${formatPrice(item.purchasePrice)}</span>
                </td>
                <td>
                    <span class="item-price">${formatPrice(item.sellPrice)}</span>
                </td>
                <td>
                    <span class="item-date">${formatDate(item.purchaseDate)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <div class="action-menu-container">
                            <button class="action-menu-btn" onclick="event.stopPropagation(); toggleActionMenu(this, ${item.id});" title="Действия">
                                <span class="menu-dots">⋮</span>
                            </button>
                            <div class="action-menu hidden">
                                <button class="menu-item" onclick="event.stopPropagation(); duplicateItem(${item.id});">Дублировать</button>
                                <button class="menu-item" onclick="event.stopPropagation(); openEditItemModal(${item.id});">Редактировать</button>
                                <button class="menu-item menu-item--danger" onclick="event.stopPropagation(); confirmDelete(${item.id});">Удалить</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add click event listeners to table rows
    document.querySelectorAll('.table-row-clickable').forEach(row => {
        // Left click to open item details
        row.addEventListener('click', function(e) {
            // Prevent opening modal if clicking on action buttons
            if (e.target.closest('.action-buttons')) {
                return;
            }
            const itemId = parseInt(this.dataset.itemId);
            openViewModal(itemId);
        });
        
        // Right click to open context menu
        row.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent browser context menu
            
            // Close any open menus first
            closeAllActionMenus();
            
            // Find the menu button for this row
            const menuButton = this.querySelector('.action-menu-btn');
            if (menuButton) {
                const itemId = parseInt(this.dataset.itemId);
                // Open the menu at the right-click position
                toggleActionMenuAtPosition(menuButton, itemId, e.clientX, e.clientY);
            }
        });
    });
}

// Получение CSS класса для состояния
function getConditionClass(condition) {
    const conditionMap = {
        'Новый': 'condition-new',
        'Отличное': 'condition-excellent',
        'Хорошее': 'condition-good',
        'Удовлетворительное': 'condition-fair',
        'Плохое': 'condition-poor',
        'Витринный образец': 'condition-display',
        'Восстановленный': 'condition-refurbished',
        'Б/у': 'condition-used'
    };
    return conditionMap[condition] || 'condition-fair';
}

// Обновление статистики
function updateStats() {
    const foundCount = filteredItems.length;
    const totalPrice = filteredItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    
    const foundCountEl = document.getElementById('foundCount');
    const totalPriceEl = document.getElementById('totalPrice');
    
    if (foundCountEl) foundCountEl.textContent = foundCount;
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(totalPrice);
}

// Очистка фильтров
function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const priceFromFilter = document.getElementById('priceFromFilter');
    if (priceFromFilter) priceFromFilter.value = '';
    
    const priceToFilter = document.getElementById('priceToFilter');
    if (priceToFilter) priceToFilter.value = '';
    
    const dateFromFilter = document.getElementById('dateFromFilter');
    if (dateFromFilter) dateFromFilter.value = '';
    
    const dateToFilter = document.getElementById('dateToFilter');
    if (dateToFilter) dateToFilter.value = '';
    
    // Очистка чекбоксов
    document.querySelectorAll('#categoryFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('#conditionFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // Сброс сортировки
    currentSort = { column: null, direction: 'asc' };
    updateSortIndicators();
    
    applyFilters();
}

// Подтверждение удаления
function confirmDelete(itemId) {
    const item = items.find(i => i.id === itemId);
    if (item && confirm(`Вы уверены, что хотите удалить "${item.name}"?`)) {
        deleteItem(itemId);
    }
}

// Модальные окна
function openAddItemModal() {
    console.log('Opening add item modal');
    currentEditingId = null;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Добавить вещь';
    clearForm();
    showModal('itemModal');
}

function openEditItemModal(itemId) {
    console.log('Opening edit modal for item', itemId);
    currentEditingId = itemId;
    const item = items.find(i => i.id === itemId);
    if (item) {
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Редактировать вещь';
        fillForm(item);
        showModal('itemModal');
    }
}

function closeItemModal() {
    hideModal('itemModal');
    clearForm();
    currentEditingId = null;
}

function openViewModal(itemId) {
    console.log('Opening view modal for item', itemId);
    const item = items.find(i => i.id === itemId);
    if (item) {
        currentViewingId = itemId;
        const viewModalTitle = document.getElementById('viewModalTitle');
        const viewModalContent = document.getElementById('viewModalContent');
        
        if (viewModalTitle) viewModalTitle.textContent = item.name;
        if (viewModalContent) viewModalContent.innerHTML = createViewContent(item);
        
        showModal('viewModal');
    }
}

function closeViewModal() {
    hideModal('viewModal');
    currentViewingId = null;
}

function openStatsModal() {
    console.log('Opening stats modal');
    const statsContent = document.getElementById('statsContent');
    if (statsContent) statsContent.innerHTML = createStatsContent();
    showModal('statsModal');
}

function closeStatsModal() {
    hideModal('statsModal');
}

function showModal(modalId) {
    console.log('Showing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('visible'), 10);
    } else {
        console.error('Modal not found:', modalId);
    }
}

function hideModal(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.classList.add('hidden'), 250);
    }
}

// Работа с формой
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    const formData = collectFormData();
    
    if (currentEditingId) {
        updateItem(currentEditingId, formData);
    } else {
        addItem(formData);
    }
    
    closeItemModal();
    applyFilters();
}

function collectFormData() {
    const getData = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };
    
    const photosText = getData('itemPhotos');
    const photos = photosText ? photosText.split('\n').map(url => url.trim()).filter(url => url) : [];
    
    const tagsText = getData('itemTags');
    const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    return {
        name: getData('itemName'),
        description: getData('itemDescription'),
        purchaseDate: getData('itemPurchaseDate'),
        website: getData('itemWebsite'),
        photos: photos,
        mainPhoto: 0,
        purchasePrice: parseFloat(getData('itemPurchasePrice')) || 0,
        sellPrice: parseFloat(getData('itemSellPrice')) || null,
        condition: getData('itemCondition'),
        conditionComment: getData('itemConditionComment'),
        category: getData('itemCategory'),
        tags: tags,
        manufacturer: getData('itemManufacturer'),
        material: getData('itemMaterial'),
        dimensions: getData('itemDimensions'),
        weight: getData('itemWeight'),
        color: getData('itemColor'),
        model: getData('itemModel'),
        warrantyPeriod: getData('itemWarrantyPeriod'),
        completeness: getData('itemCompleteness'),
        purchaseLocation: getData('itemPurchaseLocation'),
        countryOfOrigin: getData('itemCountryOfOrigin'),
        notes: getData('itemNotes')
    };
}

function fillForm(item) {
    const setData = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };
    
    setData('itemName', item.name);
    setData('itemDescription', item.description);
    setData('itemPurchaseDate', item.purchaseDate);
    setData('itemWebsite', item.website);
    setData('itemPhotos', (item.photos || []).join('\n'));
    setData('itemPurchasePrice', item.purchasePrice);
    setData('itemSellPrice', item.sellPrice);
    setData('itemCondition', item.condition);
    setData('itemConditionComment', item.conditionComment);
    setData('itemCategory', item.category);
    setData('itemTags', (item.tags || []).join(', '));
    setData('itemManufacturer', item.manufacturer);
    setData('itemMaterial', item.material);
    setData('itemDimensions', item.dimensions);
    setData('itemWeight', item.weight);
    setData('itemColor', item.color);
    setData('itemModel', item.model);
    setData('itemWarrantyPeriod', item.warrantyPeriod);
    setData('itemCompleteness', item.completeness);
    setData('itemPurchaseLocation', item.purchaseLocation);
    setData('itemCountryOfOrigin', item.countryOfOrigin);
    setData('itemNotes', item.notes);
}

function clearForm() {
    const itemForm = document.getElementById('itemForm');
    if (itemForm) itemForm.reset();
}

// CRUD операции
function addItem(itemData) {
    const newItem = {
        id: nextId++,
        ...itemData
    };
    items.push(newItem);
    saveData();
    console.log('Item added:', newItem);
}

function updateItem(id, itemData) {
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items[index] = { ...items[index], ...itemData };
        saveData();
        console.log('Item updated:', items[index]);
    }
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveData();
    applyFilters();
    console.log('Item deleted:', id);
}

function editCurrentItem() {
    if (currentViewingId) {
        closeViewModal();
        openEditItemModal(currentViewingId);
    }
}

function deleteCurrentItem() {
    if (currentViewingId) {
        const item = items.find(i => i.id === currentViewingId);
        if (item && confirm(`Вы уверены, что хотите удалить "${item.name}"?`)) {
            deleteItem(currentViewingId);
            closeViewModal();
        }
    }
}

// Создание контента для просмотра
function createViewContent(item) {
    const photos = item.photos && item.photos.length > 0 
        ? item.photos.map(photo => `<div class="view-photo" style="background-image: url('${photo}')"></div>`).join('')
        : '<div class="view-photo">Нет фотографий</div>';
    
    const tags = item.tags && item.tags.length > 0
        ? item.tags.map(tag => `<span class="view-tag">${escapeHtml(tag)}</span>`).join('')
        : '<span class="text-muted">Нет тегов</span>';
    
    return `
        <div class="view-content">
            <div class="view-photos">${photos}</div>
            
            <div class="view-details">
                <div class="view-detail-group">
                    <h4>Основная информация</h4>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Название:</span>
                        <span class="view-detail-value">${escapeHtml(item.name)}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Категория:</span>
                        <span class="view-detail-value">${escapeHtml(item.category || 'Не указана')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Описание:</span>
                        <span class="view-detail-value">${escapeHtml(item.description || 'Не указано')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Дата покупки:</span>
                        <span class="view-detail-value">${formatDate(item.purchaseDate)}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Сайт:</span>
                        <span class="view-detail-value">
                            ${item.website ? `<a href="${item.website}" target="_blank" class="view-website">${item.website}</a>` : 'Не указан'}
                        </span>
                    </div>
                </div>
                
                <div class="view-detail-group">
                    <h4>Цены и состояние</h4>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Цена покупки:</span>
                        <span class="view-detail-value">${formatPrice(item.purchasePrice)}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Цена продажи:</span>
                        <span class="view-detail-value">${formatPrice(item.sellPrice)}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Состояние:</span>
                        <span class="view-detail-value">${escapeHtml(item.condition || 'Не указано')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Комментарий:</span>
                        <span class="view-detail-value">${escapeHtml(item.conditionComment || 'Нет комментария')}</span>
                    </div>
                </div>
                
                <div class="view-detail-group">
                    <h4>Характеристики</h4>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Производитель:</span>
                        <span class="view-detail-value">${escapeHtml(item.manufacturer || 'Не указан')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Модель:</span>
                        <span class="view-detail-value">${escapeHtml(item.model || 'Не указана')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Материал:</span>
                        <span class="view-detail-value">${escapeHtml(item.material || 'Не указан')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Размеры:</span>
                        <span class="view-detail-value">${escapeHtml(item.dimensions || 'Не указаны')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Вес:</span>
                        <span class="view-detail-value">${escapeHtml(item.weight || 'Не указан')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Цвет:</span>
                        <span class="view-detail-value">${escapeHtml(item.color || 'Не указан')}</span>
                    </div>
                </div>
                
                <div class="view-detail-group">
                    <h4>Дополнительно</h4>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Гарантия:</span>
                        <span class="view-detail-value">${escapeHtml(item.warrantyPeriod || 'Не указана')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Комплектность:</span>
                        <span class="view-detail-value">${escapeHtml(item.completeness || 'Не указана')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Место покупки:</span>
                        <span class="view-detail-value">${escapeHtml(item.purchaseLocation || 'Не указано')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Страна:</span>
                        <span class="view-detail-value">${escapeHtml(item.countryOfOrigin || 'Не указана')}</span>
                    </div>
                    <div class="view-detail-item">
                        <span class="view-detail-label">Заметки:</span>
                        <span class="view-detail-value">${escapeHtml(item.notes || 'Нет заметок')}</span>
                    </div>
                </div>
            </div>
            
            <div class="view-detail-group">
                <h4>Теги</h4>
                <div class="view-tags">${tags}</div>
            </div>
        </div>
    `;
}

// Создание контента статистики
function createStatsContent() {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
    
    // Статистика по категориям
    const categoryStats = {};
    items.forEach(item => {
        const category = item.category || 'Без категории';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    // Статистика по состояниям
    const conditionStats = {};
    items.forEach(item => {
        const condition = item.condition || 'Не указано';
        conditionStats[condition] = (conditionStats[condition] || 0) + 1;
    });
    
    const categoryStatsHtml = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => `
            <div class="stats-item">
                <span class="stats-item-label">${escapeHtml(category)}</span>
                <span class="stats-item-value">${count} шт.</span>
            </div>
        `).join('');
    
    const conditionStatsHtml = Object.entries(conditionStats)
        .sort(([,a], [,b]) => b - a)
        .map(([condition, count]) => `
            <div class="stats-item">
                <span class="stats-item-label">${escapeHtml(condition)}</span>
                <span class="stats-item-value">${count} шт.</span>
            </div>
        `).join('');
    
    return `
        <div class="stats-grid">
            <div class="stats-card">
                <h4>Всего вещей</h4>
                <div class="stats-value">${totalItems}</div>
            </div>
            <div class="stats-card">
                <h4>Общая стоимость</h4>
                <div class="stats-value">${formatPrice(totalValue)}</div>
            </div>
            <div class="stats-card">
                <h4>Средняя цена</h4>
                <div class="stats-value">${formatPrice(averagePrice)}</div>
            </div>
        </div>
        
        <div class="stats-distribution">
            <h4>Распределение по категориям</h4>
            ${categoryStatsHtml}
        </div>
        
        <div class="stats-distribution">
            <h4>Распределение по состояниям</h4>
            ${conditionStatsHtml}
        </div>
    `;
}

// Импорт и экспорт
function exportData() {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `catalog_items_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importData() {
    const importInput = document.getElementById('importInput');
    if (importInput) importInput.click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedItems = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedItems)) {
                alert('Неверный формат файла. Ожидается массив объектов.');
                return;
            }
            
            if (confirm(`Импортировать ${importedItems.length} записей? Это заменит все текущие данные.`)) {
                items = importedItems;
                nextId = Math.max(...items.map(item => item.id || 0), 0) + 1;
                saveData();
                applyFilters();
                alert(`Успешно импортировано ${importedItems.length} записей.`);
            }
        } catch (error) {
            alert('Ошибка при чтении файла. Проверьте формат JSON.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    
    // Сбрасываем значение input
    event.target.value = '';
}

// Переключение компактного вида
function toggleCompactView() {
    isCompactView = !isCompactView;
    const tableContainer = document.querySelector('.table-container');
    const toggleIcon = document.getElementById('viewToggleIcon');
    
    if (tableContainer) {
        if (isCompactView) {
            tableContainer.classList.add('compact');
        } else {
            tableContainer.classList.remove('compact');
        }
    }
    
    if (toggleIcon) {
        toggleIcon.textContent = isCompactView ? '🗜️' : '⬜';
    }
    
    // Сохраняем состояние в localStorage
    try {
        localStorage.setItem('catalogCompactView', JSON.stringify(isCompactView));
    } catch (error) {
        console.error('Error saving compact view state:', error);
    }
}

// Переключение меню действий
function toggleActionMenu(button, itemId) {
    // Закрываем все другие открытые меню
    document.querySelectorAll('.action-menu').forEach(menu => {
        if (menu !== button.nextElementSibling) {
            menu.classList.add('hidden');
            // Сбрасываем позиционирование
            menu.style.position = '';
            menu.style.top = '';
            menu.style.left = '';
            menu.style.right = '';
            menu.style.bottom = '';
        }
    });
    
    // Переключаем текущее меню
    const menu = button.nextElementSibling;
    menu.classList.toggle('hidden');
    
    // Позиционируем меню относительно кнопки
    if (!menu.classList.contains('hidden')) {
        const buttonRect = button.getBoundingClientRect();
        positionActionMenu(menu, buttonRect.left, buttonRect.bottom + 2);
    } else {
        // Возвращаем обычное позиционирование
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.right = '';
        menu.style.bottom = '';
    }
}

// Открытие меню в указанной позиции (для правого клика)
function toggleActionMenuAtPosition(button, itemId, x, y) {
    // Закрываем все другие открытые меню
    document.querySelectorAll('.action-menu').forEach(menu => {
        menu.classList.add('hidden');
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.right = '';
        menu.style.bottom = '';
    });
    
    // Открываем меню
    const menu = button.nextElementSibling;
    menu.classList.remove('hidden');
    
    // Позиционируем меню в позиции курсора
    positionActionMenu(menu, x, y);
}

// Функция позиционирования меню
function positionActionMenu(menu, x, y) {
    // Используем fixed позиционирование для выхода за пределы контейнера
    menu.style.position = 'fixed';
    
    // Получаем размеры меню (сначала показываем его для измерения)
    menu.style.visibility = 'hidden';
    menu.style.display = 'block';
    const menuRect = menu.getBoundingClientRect();
    menu.style.visibility = '';
    menu.style.display = '';
    
    // Рассчитываем оптимальную позицию
    let left = x;
    let top = y;
    
    // Проверяем горизонтальное переполнение
    if (left + menuRect.width > window.innerWidth) {
        // Меню выходит за правую границу - сдвигаем влево
        left = x - menuRect.width;
    }
    
    // Проверяем, что меню не выходит за левую границу
    if (left < 0) {
        left = 8; // Минимальный отступ от края экрана
    }
    
    // Проверяем вертикальное переполнение
    if (top + menuRect.height > window.innerHeight) {
        // Меню выходит за нижнюю границу - показываем сверху
        top = y - menuRect.height;
    }
    
    // Проверяем, что меню не выходит за верхнюю границу
    if (top < 0) {
        top = 8; // Минимальный отступ от верха экрана
    }
    
    // Применяем позицию
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.right = 'auto';
    menu.style.bottom = 'auto';
}

// Дублирование элемента
function duplicateItem(itemId) {
    const item = items.find(i => i.id === itemId);
    if (item) {
        const duplicatedItem = {
            ...item,
            id: nextId++,
            name: `${item.name} (копия)`
        };
        items.push(duplicatedItem);
        saveData();
        applyFilters();
        console.log('Item duplicated:', duplicatedItem);
    }
}

// Закрытие всех меню при клике вне их
function closeAllActionMenus() {
    document.querySelectorAll('.action-menu').forEach(menu => {
        menu.classList.add('hidden');
        // Сбрасываем позиционирование
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.right = '';
        menu.style.bottom = '';
    });
}

// Инициализация состояния компактного вида
function initializeCompactView() {
    try {
        const savedState = localStorage.getItem('catalogCompactView');
        if (savedState !== null) {
            isCompactView = JSON.parse(savedState);
            const tableContainer = document.querySelector('.table-container');
            const toggleIcon = document.getElementById('viewToggleIcon');
            
            if (tableContainer && isCompactView) {
                tableContainer.classList.add('compact');
            }
            
            if (toggleIcon) {
                toggleIcon.textContent = isCompactView ? '🗜️' : '⬜';
            }
        }
    } catch (error) {
        console.error('Error loading compact view state:', error);
    }
}

// Утилиты
function formatPrice(price) {
    if (!price && price !== 0) return '-';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return '-';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Функция debounce для оптимизации поиска
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Утилиты
function formatPrice(price) {
    if (!price && price !== 0) return '-';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('ru-RU');
    } catch {
        return 'Неверная дата';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Глобальные функции для кнопок
window.openAddItemModal = openAddItemModal;
window.openEditItemModal = openEditItemModal;
window.openViewModal = openViewModal;
window.confirmDelete = confirmDelete;
window.closeItemModal = closeItemModal;
window.closeViewModal = closeViewModal;
window.closeStatsModal = closeStatsModal;