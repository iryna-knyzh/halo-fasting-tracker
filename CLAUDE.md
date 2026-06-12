# CLAUDE.md

## Проект

**Halo** — fasting tracker. Next.js 14 фронтенд + NestJS бекенд + PostgreSQL, все в Docker Compose.

## Запуск

```bash
docker-compose up -d          # підняти всі сервіси
docker-compose down           # зупинити
docker-compose restart backend  # перезапустити бекенд
```

Контейнери: `db`, `backend`, `frontend`.

## Структура

```
frontend/src/
  app/                        # Next.js App Router
  styles/_variables.scss      # Спільні SCSS-токени (кольори, градієнти, тіні, брейкпоінти)
  styles/_mixins.scss         # on-tablet (≥640px), on-desktop (≥1200px), container, card-frame
  components/                 # Кожен компонент: Component.tsx / .module.scss / index.ts
    FastTracker/               # Кореневий компонент зі станом
    AppScreen/                 # Головний екран (кільце, чарт, історія)
    AuthScreen/                # Вхід / реєстрація
  types/fast.types.ts          # User, FastSession, ActiveFast, AuthMode
  lib/api-client.ts            # HTTP клієнт з авто-refresh JWT
  lib/utils.ts                 # Допоміжні функції форматування

backend/src/
  auth/                       # JWT авторизація
    strategies/jwt.strategy.ts
    guards/jwt-auth.guard.ts
    decorators/current-user.decorator.ts
    dto/                       # register, login, refresh DTOs
  fasting/                    # Сесії голодування
  user/                       # CRUD користувачів
  entities/                   # user.entity.ts, fasting-session.entity.ts
```

Кожен компонент — у своїй папці: `Component.tsx` + `Component.module.scss` + `index.ts` (re-export). Стилі — тільки в SCSS-модулях, без інлайнових `style`; спільні токени — в `src/styles/_variables.scss`.

Адаптивність — mobile-first: базові стилі для мобілки, перевизначення через міксини `on-tablet` / `on-desktop` з `src/styles/_mixins.scss`. Сирі `@media` в модулях не писати. На мобілці картки на весь екран без рамки/тіні (`card-frame`), на десктопі контейнер max-width 1200px (`container`).

## Авторизація

- **Access token**: 1 год, `JWT_ACCESS_SECRET`
- **Refresh token**: 30 днів, хеш зберігається в `users.refreshTokenHash` (select: false)
- На 401 фронтенд автоматично робить refresh і повторює запит
- Logout інвалідує refresh token в БД

## База даних

TypeORM `synchronize: true` в development — схема оновлюється автоматично.

Таблиці: `users`, `fasting_sessions`.

Поля `password` та `refreshTokenHash` мають `select: false` — не повертаються в звичайних запитах.

## Змінні оточення

Дивись `env.example`. Критичні для продакшену: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.

## Перевірка TypeScript

```bash
docker exec backend sh -c "cd /app && npx tsc --noEmit"
docker exec frontend sh -c "cd /app && npx tsc --noEmit"
```

## Swagger

http://localhost:4000/api/docs — авторизуйся через `Authorize` → вставити access token.
