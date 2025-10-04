@echo off
REM Переходим в директорию проекта
cd /d "D:\portfolio\estate_crm_back"

REM Добавляем файл с результатами
git add .

REM Создаем коммит (сообщение будет включать текущую дату/время)
git commit -m "Automated push of final Krisha data: %date% %time%"

REM Отправляем изменения на удаленный репозиторий
REM Если ваша основная ветка называется 'master', оставьте так. Если 'main', измените.
git push origin master