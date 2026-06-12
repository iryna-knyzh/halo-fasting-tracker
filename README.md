# Halo — Fasting Tracker

Повноцінний fullstack застосунок для трекінгу голодування. Next.js 14 фронтенд, NestJS бекенд, PostgreSQL база даних — все запускається через Docker Compose.

## Стек

- **Frontend**: Next.js 14, TypeScript, CSS-in-JS
- **Backend**: NestJS, TypeORM, JWT авторизація, Swagger
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker Compose

## Швидкий старт

```bash
# Клонувати репозиторій
git clone <repository-url>
cd fullstack-template

# Налаштувати змінні оточення (опціонально)
cp env.example .env

# Запустити
make up
# або
docker-compose up -d
```

Після запуску:
- Застосунок: http://localhost:3000
- Swagger API: http://localhost:4000/api/docs

## Команди

| Команда | Опис |
|---------|------|
| `make up` | Запустити всі сервіси |
| `make down` | Зупинити всі сервіси |
| `make logs` | Логи всіх сервісів |
| `make logs-backend` | Логи бекенду |
| `make logs-frontend` | Логи фронтенду |
| `make logs-db` | Логи бази даних |
| `make restart` | Перезапустити сервіси |
| `make db` | Підключитися до PostgreSQL |
| `make db-migrate` | Запустити міграції |
| `make clean` | Повне очищення (volumes, containers) |
| `make clean-db` | Очистити тільки базу даних |

## Структура

```
fullstack-template/
├── frontend/          # Next.js застосунок
│   └── src/
│       ├── app/       # Next.js App Router
│       ├── components/FastTracker/  # Основний UI
│       └── lib/       # API client з JWT логікою
├── backend/           # NestJS API
│   └── src/
│       ├── auth/      # JWT авторизація (register, login, refresh, logout)
│       ├── fasting/   # Сесії голодування
│       ├── user/      # Користувачі
│       └── entities/  # TypeORM entities
├── docker-compose.yml
├── env.example        # Шаблон змінних оточення
└── Makefile
```

## API

### Авторизація
| Метод | Ендпоінт | Опис |
|-------|----------|------|
| `POST` | `/api/auth/register` | Реєстрація → `{ user, accessToken, refreshToken }` |
| `POST` | `/api/auth/login` | Вхід → `{ user, accessToken, refreshToken }` |
| `POST` | `/api/auth/refresh` | Оновити access token |
| `POST` | `/api/auth/logout` | Вихід (інвалідує refresh token) |

### Голодування (потребує Bearer токен)
| Метод | Ендпоінт | Опис |
|-------|----------|------|
| `GET` | `/api/fasting` | Отримати свої сесії |
| `POST` | `/api/fasting` | Зберегти сесію |
| `DELETE` | `/api/fasting` | Очистити всі сесії |
| `DELETE` | `/api/fasting/:id` | Видалити одну сесію |

## Конфігурація

Скопіюй `env.example` → `.env` і задай свої значення:

```env
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=app_db
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

## Корисні посилання

- [Next.js](https://nextjs.org/docs)
- [NestJS](https://docs.nestjs.com)
- [TypeORM](https://typeorm.io)
- [Docker Compose](https://docs.docker.com/compose/)
