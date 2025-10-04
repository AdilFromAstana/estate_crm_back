const puppeteer = require('puppeteer');
const fs = require('fs');

// --- Настройки (ОБЯЗАТЕЛЬНО ЗАМЕНИТЬ) ---
const LOGIN_URL = "https://id.kolesa.kz/login/?destination=https%3A%2F%2Fkrisha.kz%2Fa%2Fshow%2F1005268321%3Fsrchid%3D01997497-8da6-7e01-9c4c-adc555e8db3e%26srchtype%3Dhot_block_filter%26srchpos%3D3"; // URL страницы логина
const TARGET_PAGE_URL = "https://krisha.kz/a/new"; // Целевая страница после входа

const USERNAME = "7761156416"; // Ваш логин
const PASSWORD = "Skazalya21."; // Ваш пароль

const SELECTORS = {
    // 1. Поля формы
    CSRF_TOKEN_INPUT: "input[name='csrf']",
    LOGIN_INPUT: "input[name='login']",
    PASSWORD_INPUT: "input[name='password']",

    // 2. Кнопки авторизации
    CONTINUE_BUTTON: "button.ui-button--blue",

    // 3. Селекторы для меню "Подать объявление" (Продать -> Квартиру)
    CATEGORY_SELL: 'li[data-value="sell"]',
    CATEGORY_FLAT: 'li[data-value="sell.flat"]',

    // 4. Селекторы для выбора города и ЖК
    CITY_ASTANA: 'select[name="map_geo_id"] option[value="105"]', // Выбор Астаны
    COMPLEX_DROPDOWN: '.selectbox[data-for="map_complex"] .selectbox-select',

    // 5. URL для перехвата запросов
    DATA_REQUEST_URL_PATTERN: 'https://app.krisha.kz/data/getObjectInfo',
};
// --- Конец Настроек ---

/**
 * Функция для агрессивного скроллинга контейнера, пока элемент не появится.
 * @param {import('puppeteer').Page} page
 * @param {string} containerSelector - Селектор родительского контейнера списка.
 * @param {string} targetSelector - Селектор элемента, который мы ищем.
 * @returns {Promise<import('puppeteer').ElementHandle | null>}
 */
async function safeScrollAndFind(page, containerSelector, targetSelector, complexName) {
    const MAX_SCROLL_ATTEMPTS = 50; // Максимум 50 раз прокручиваем
    const SCROLL_AMOUNT = 200; // Прокрутка на 200px за раз

    for (let attempt = 1; attempt <= MAX_SCROLL_ATTEMPTS; attempt++) {
        // 1. Пытаемся найти элемент
        const elementHandle = await page.$(targetSelector);

        if (elementHandle) {
            // Элемент найден! Скроллим его в центр, чтобы он был доступен для клика, и возвращаем.
            await elementHandle.evaluate(el => el.scrollIntoView({ block: "center" }));
            return elementHandle;
        }

        // 2. Элемент не найден, выполняем скроллинг
        await page.$eval(containerSelector, (ul, amount) => {
            ul.scrollTop += amount; // Скроллим вниз
        }, SCROLL_AMOUNT);

        console.log(`     [СКРОЛЛ] Попытка ${attempt}/${MAX_SCROLL_ATTEMPTS}. Ищем: "${complexName}". Прокручено на ${SCROLL_AMOUNT}px.`);

        // 3. Пауза для прогрузки DOM после скролла
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.warn(`     ❌ Не удалось найти элемент "${complexName}" (${targetSelector}) после ${MAX_SCROLL_ATTEMPTS} попыток скроллинга.`);
    return null; // Элемент так и не появился
}


async function runPuppeteerParser() {
    console.log("1. Запуск браузера (визуальный режим)...");

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });
    const page = await browser.newPage();

    let complexItems = []; // Определяем здесь, чтобы было доступно в responseHandler

    try {
        // --- Шаг 1: АВТОРИЗАЦИЯ И ПЕРЕХОД НА СТРАНИЦУ ЖК ---
        await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
        console.log(`\n1.1 Переход на страницу логина: ${LOGIN_URL}`);

        await page.waitForSelector(SELECTORS.CSRF_TOKEN_INPUT, { timeout: 10000 });
        const csrfToken = await page.$eval(SELECTORS.CSRF_TOKEN_INPUT, el => el.value);
        console.log(`   ✅ CSRF-токен получен: ${csrfToken.substring(0, 10)}...`);

        await page.type(SELECTORS.LOGIN_INPUT, USERNAME);
        await page.click(SELECTORS.CONTINUE_BUTTON);

        await page.waitForSelector(SELECTORS.PASSWORD_INPUT, { visible: true, timeout: 10000 });
        await page.type(SELECTORS.PASSWORD_INPUT, PASSWORD);

        console.log("   Нажатие 'Вход' и ожидание редиректа...");
        const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.click(SELECTORS.CONTINUE_BUTTON);
        await navigationPromise;

        if (page.url().includes('login')) {
            throw new Error("Авторизация не удалась. Остались на странице логина.");
        }

        console.log("   ✅ Авторизация успешна.");

        console.log("   ⏸️ Пауза 3 секунды перед переходом...");
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log("   Выполняем переход на целевую страницу ЖК...");
        await page.goto(TARGET_PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log(`   ✅ Переход на ${TARGET_PAGE_URL} завершен.`);

        // --- ШАГ 1.8: ВЫБОР "ПРОДАТЬ" -> "КВАРТИРУ" ---
        console.log("\n1.8 Выбор 'Продать' и 'Квартиру'...");
        console.log("   ⏸️ Пауза 5 секунд для стабилизации DOM...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.waitForSelector(SELECTORS.CATEGORY_SELL, { visible: true, timeout: 15000 });
        await page.click(SELECTORS.CATEGORY_SELL);
        console.log("   ✅ Нажат 'Продать'.");

        await page.waitForSelector(SELECTORS.CATEGORY_FLAT, { visible: true, timeout: 10000 });
        await page.click(SELECTORS.CATEGORY_FLAT);
        console.log("   ✅ Нажата 'Квартира'.");

        // --- Шаг 2: ВЫБОР ГОРОДА (АСТАНА) ---
        console.log("\n2. Выбор города 'Астана'...");

        const selectSelector = 'select[name="map_geo_id"]';
        await page.waitForSelector(selectSelector, { visible: true, timeout: 15000 });
        await page.select(selectSelector, '105');
        console.log("   ✅ Выбран город Астана.");

        console.log("   ⏸️ Пауза 3 секунды после выбора города...");
        await new Promise(resolve => setTimeout(resolve, 3000));

        // --- Шаг 3: РАСКРЫТИЕ СПИСКА ЖК ---
        console.log("\n3. Раскрытие списка ЖК...");

        await page.waitForSelector(SELECTORS.COMPLEX_DROPDOWN, { visible: true, timeout: 10000 });
        await page.click(SELECTORS.COMPLEX_DROPDOWN);
        console.log("   ✅ Список ЖК раскрыт.");

        // --- Шаг 4: СБОР СПИСКА ЭЛЕМЕНТОВ ЖК ---
        const complexOptionsSelectorLi = '.selectbox-options li[data-value]';
        await page.waitForSelector(complexOptionsSelectorLi, { visible: true, timeout: 10000 });

        complexItems = await page.$$eval(complexOptionsSelectorLi, elements =>
            elements.map(el => {
                // Извлекаем данные и проверяем класс 'hidden'
                const isHidden = el.classList.contains('hidden');
                return {
                    id: el.getAttribute('data-value'),
                    name: el.innerText.trim(),
                    isHidden: isHidden
                };
            })
                // ФИЛЬТР: Исключаем элементы без ID/имени и все скрытые элементы
                .filter(item => item.id && item.name.length > 0 && !item.isHidden)
                .map(({ id, name }) => ({ id, name })) // Очищаем от лишнего флага isHidden
        );

        if (complexItems.length === 0) {
            console.log("   ⚠️ Не удалось найти валидные элементы списка ЖК.");
            return;
        }
        console.log(`   ✅ Обнаружено ${complexItems.length} ЖК для обработки (после фильтрации).`);

        // --- Шаг 5: ИТЕРАЦИЯ, КЛИК И ПЕРЕХВАТ ДАННЫХ (КРИТИЧЕСКИЙ БЛОК) ---
        console.log("\n4. Итерация по ЖК и перехват данных...");

        const allComplexDetails = [];

        // Обработчик для перехвата ответа с данными ЖК
        const responseHandler = async response => {
            const url = response.url();

            if (url.startsWith(SELECTORS.DATA_REQUEST_URL_PATTERN) && response.status() === 200) {
                try {
                    const data = await response.json();
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    const complexId = urlParams.get('map_complex_id');

                    if (complexId) {
                        const existingIndex = allComplexDetails.findIndex(item => item.id === complexId);

                        if (existingIndex === -1) {
                            // Находим имя ЖК по его ID из предварительно собранного списка
                            const complexName = complexItems.find(item => item.id === complexId)?.name || "Неизвестно";

                            allComplexDetails.push({
                                id: complexId,
                                name: complexName,
                                details: data
                            });
                            console.log(`     ✅ Данные получены для ID: ${complexId} (${complexName})`);

                            // Вывод для отладки
                            console.log('     [DEBUG] Полученный JSON:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
                        }
                    }
                } catch (e) {
                    // Игнорируем ошибки парсинга
                }
            }
        };

        page.on('response', responseHandler); // Подписываемся на событие

        const complexDropdownSelector = SELECTORS.COMPLEX_DROPDOWN;
        const complexOptionsSelector = '.selectbox-options'; // Селектор для самого списка UL (ul-контейнер)

        // 2. ИТЕРАЦИЯ (КЛИК)
        for (let i = 0; i < complexItems.length; i++) {
            const item = complexItems[i];
            const complexSelector = `li[data-value="${item.id}"]`;

            // --- ДЕБАГ-ВЫВОД ---
            const nextItem = complexItems[i + 1];
            console.log(`\n--- ЦИКЛ ${i + 1}/${complexItems.length} ---`);
            console.log(`   ⚙️ ТЕКУЩИЙ ЖК: "${item.name}" (ID: ${item.id})`);
            if (nextItem) {
                console.log(`   ⏭️ СЛЕДУЮЩИЙ ЖК: "${nextItem.name}" (ID: ${nextItem.id})`);
            } else {
                console.log(`   ⏭️ СЛЕДУЮЩИЙ ЖК: Конец списка.`);
            }
            // -------------------------

            // 1. ПОВТОРНО ОТКРЫВАЕМ СПИСОК ПЕРЕД КАЖДЫМ КЛИКОМ (кроме первого)
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Клик для раскрытия списка
                await page.waitForSelector(complexDropdownSelector, { visible: true, timeout: 1000 });
                await page.click(complexDropdownSelector);

                // Ждем, пока сам UL-список станет видимым
                await page.waitForSelector(complexOptionsSelector, { visible: true, timeout: 1000 });

                console.log(`   [Цикл ${i + 1}] Список ЖК снова раскрыт.`);
            }

            // 2. Поиск элемента с агрессивным скроллингом
            console.log(`   [Цикл ${i + 1}] Выполняем поиск и скроллинг контейнера для ЖК "${item.name}" (ID: ${item.id})`);

            // Используем новую, надежную функцию скроллинга
            const elementHandle = await safeScrollAndFind(
                page,
                complexOptionsSelector,
                complexSelector,
                item.name
            );

            // 3. КЛИК
            console.log(`   > Клик по ЖК "${item.name}" (ID: ${item.id}) (${i + 1}/${complexItems.length})`);

            if (elementHandle) {
                // ИСПОЛЬЗУЕМ ПРИНУДИТЕЛЬНЫЙ КЛИК В КОНТЕКСТЕ БРАУЗЕРА 
                // (теперь этот элемент точно не hidden, благодаря фильтрации)
                await elementHandle.evaluate(el => el.click());
            } else {
                console.warn(`   ⚠️ Не удалось найти элемент ЖК ${item.id}. Пропускаем.`);
                continue;
            }

            // 4. Пауза 3 секунды между кликами (для перехвата ответа)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 3. ОТКЛЮЧАЕМ ПЕРЕХВАТЧИК
        console.log("\n   Ожидание завершения всех перехватов запросов...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        page.off('response', responseHandler); // Отписываемся от события

        console.log("\n5. Сбор данных завершен.");

        return allComplexDetails;

    } catch (error) {
        console.error("   ❌ Критическая ошибка в процессе:", error.message);
        await page.screenshot({ path: "critical_error.png" });
        console.log("   Сохранен скриншот критической ошибки: critical_error.png");

    } finally {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await browser.close();
    }

    return [];
}

// Запуск парсера и вывод результатов
runPuppeteerParser().then(finalData => {
    if (finalData && finalData.length > 0) {
        console.log("\n--- ИТОГОВЫЕ ДАННЫЕ ---");
        console.log(`Всего успешно обработано ЖК: ${finalData.length}`);

        const jsonOutput = JSON.stringify(finalData, null, 4);
        fs.writeFileSync('rc_results_final.json', jsonOutput);
        console.log('✅ Данные сохранены в rc_results_final.json');
    } else {
        console.log("\nНе удалось получить или обработать данные.");
    }
}).catch(err => {
    console.error("❌ Скрипт завершился с ошибкой, невозможно сохранить данные:", err.message);
});
