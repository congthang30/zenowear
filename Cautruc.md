# EasyBuy — Cấu trúc NestJS + DDD

> Refactor từ ASP.NET MVC → NestJS theo kiến trúc Domain-Driven Design (DDD)

---

## Tổng quan Bounded Contexts

Dựa trên project EasyBuy gốc (C# ASP.NET MVC — e-commerce), các domain chính gồm:

| Bounded Context | Mô tả                          |
| --------------- | ------------------------------ |
| `catalog`       | Sản phẩm, danh mục, tìm kiếm   |
| `identity`      | Đăng ký, đăng nhập, phân quyền |
| `cart`          | Giỏ hàng                       |
| `order`         | Đặt hàng, quản lý đơn          |
| `user`          | Hồ sơ người dùng               |
| `admin`         | Quản trị (tổng hợp)            |

---

## Cấu trúc thư mục đầy đủ

```
easybuy-nestjs/
│
├── src/
│   │
│   ├── modules/                          # Các bounded context (mỗi module = 1 domain)
│   │
│   │   ├── catalog/                      # 🛍️ Domain: Sản phẩm & Danh mục
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── product.entity.ts         # Aggregate Root: Product
│   │   │   │   │   └── category.entity.ts        # Entity: Category
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── product-price.vo.ts       # VO: Price (không âm, có currency)
│   │   │   │   │   ├── product-name.vo.ts        # VO: Tên sản phẩm (validate độ dài)
│   │   │   │   │   └── product-status.vo.ts      # VO: Trạng thái (active/inactive)
│   │   │   │   ├── events/
│   │   │   │   │   ├── product-created.event.ts
│   │   │   │   │   └── product-updated.event.ts
│   │   │   │   └── repositories/
│   │   │   │       ├── product.repository.ts     # Interface (port)
│   │   │   │       └── category.repository.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── create-product/
│   │   │   │   │   │   ├── create-product.command.ts
│   │   │   │   │   │   └── create-product.handler.ts
│   │   │   │   │   ├── update-product/
│   │   │   │   │   │   ├── update-product.command.ts
│   │   │   │   │   │   └── update-product.handler.ts
│   │   │   │   │   └── delete-product/
│   │   │   │   │       ├── delete-product.command.ts
│   │   │   │   │       └── delete-product.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-product-by-id/
│   │   │   │   │   │   ├── get-product-by-id.query.ts
│   │   │   │   │   │   └── get-product-by-id.handler.ts
│   │   │   │   │   ├── get-products-by-category/
│   │   │   │   │   │   ├── get-products-by-category.query.ts
│   │   │   │   │   │   └── get-products-by-category.handler.ts
│   │   │   │   │   └── search-products/
│   │   │   │   │       ├── search-products.query.ts
│   │   │   │   │       └── search-products.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── create-product.dto.ts
│   │   │   │       ├── update-product.dto.ts
│   │   │   │       └── product-response.dto.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── product.orm-entity.ts     # TypeORM entity (tách khỏi domain entity)
│   │   │   │   │   ├── category.orm-entity.ts
│   │   │   │   │   ├── product.repository.impl.ts # Implements domain repository
│   │   │   │   │   └── category.repository.impl.ts
│   │   │   │   └── mappers/
│   │   │   │       ├── product.mapper.ts         # ORM Entity ↔ Domain Entity
│   │   │   │       └── category.mapper.ts
│   │   │   │
│   │   │   ├── presentation/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── product.controller.ts     # REST API endpoints
│   │   │   │   │   └── category.controller.ts
│   │   │   │   └── guards/
│   │   │   │       └── product-owner.guard.ts
│   │   │   │
│   │   │   └── catalog.module.ts
│   │   │
│   │   ├── identity/                     # 🔐 Domain: Authentication & Authorization
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user-credential.entity.ts  # Aggregate Root
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── email.vo.ts
│   │   │   │   │   ├── password.vo.ts             # Hashed password
│   │   │   │   │   └── role.vo.ts                 # CUSTOMER | ADMIN
│   │   │   │   ├── events/
│   │   │   │   │   ├── user-registered.event.ts
│   │   │   │   │   └── user-logged-in.event.ts
│   │   │   │   └── repositories/
│   │   │   │       └── user-credential.repository.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── register/
│   │   │   │   │   │   ├── register.command.ts
│   │   │   │   │   │   └── register.handler.ts
│   │   │   │   │   └── change-password/
│   │   │   │   │       ├── change-password.command.ts
│   │   │   │   │       └── change-password.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   └── login/
│   │   │   │   │       ├── login.query.ts
│   │   │   │   │       └── login.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── register.dto.ts
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── auth-response.dto.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── user-credential.orm-entity.ts
│   │   │   │   │   └── user-credential.repository.impl.ts
│   │   │   │   ├── jwt/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   │   └── mappers/
│   │   │   │       └── user-credential.mapper.ts
│   │   │   │
│   │   │   ├── presentation/
│   │   │   │   └── controllers/
│   │   │   │       └── auth.controller.ts        # POST /auth/register, /auth/login
│   │   │   │
│   │   │   └── identity.module.ts
│   │   │
│   │   ├── user/                         # 👤 Domain: Hồ sơ người dùng
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user-profile.entity.ts    # Aggregate Root
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── full-name.vo.ts
│   │   │   │   │   ├── phone-number.vo.ts
│   │   │   │   │   └── address.vo.ts
│   │   │   │   └── repositories/
│   │   │   │       └── user-profile.repository.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   └── update-profile/
│   │   │   │   │       ├── update-profile.command.ts
│   │   │   │   │       └── update-profile.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   └── get-my-profile/
│   │   │   │   │       ├── get-my-profile.query.ts
│   │   │   │   │       └── get-my-profile.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── update-profile.dto.ts
│   │   │   │       └── user-profile-response.dto.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── user-profile.orm-entity.ts
│   │   │   │       └── user-profile.repository.impl.ts
│   │   │   │
│   │   │   ├── presentation/
│   │   │   │   └── controllers/
│   │   │   │       └── user.controller.ts        # GET/PUT /users/me
│   │   │   │
│   │   │   └── user.module.ts
│   │   │
│   │   ├── cart/                         # 🛒 Domain: Giỏ hàng
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── cart.entity.ts            # Aggregate Root
│   │   │   │   │   └── cart-item.entity.ts       # Entity con
│   │   │   │   ├── value-objects/
│   │   │   │   │   └── quantity.vo.ts            # VO: Số lượng (> 0)
│   │   │   │   ├── events/
│   │   │   │   │   ├── item-added-to-cart.event.ts
│   │   │   │   │   └── item-removed-from-cart.event.ts
│   │   │   │   └── repositories/
│   │   │   │       └── cart.repository.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── add-item/
│   │   │   │   │   │   ├── add-item.command.ts
│   │   │   │   │   │   └── add-item.handler.ts
│   │   │   │   │   ├── remove-item/
│   │   │   │   │   │   ├── remove-item.command.ts
│   │   │   │   │   │   └── remove-item.handler.ts
│   │   │   │   │   └── clear-cart/
│   │   │   │   │       ├── clear-cart.command.ts
│   │   │   │   │       └── clear-cart.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   └── get-cart/
│   │   │   │   │       ├── get-cart.query.ts
│   │   │   │   │       └── get-cart.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── add-item.dto.ts
│   │   │   │       └── cart-response.dto.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── cart.orm-entity.ts
│   │   │   │       ├── cart-item.orm-entity.ts
│   │   │   │       └── cart.repository.impl.ts
│   │   │   │
│   │   │   ├── presentation/
│   │   │   │   └── controllers/
│   │   │   │       └── cart.controller.ts        # GET/POST/DELETE /cart
│   │   │   │
│   │   │   └── cart.module.ts
│   │   │
│   │   ├── order/                        # 📦 Domain: Đơn hàng
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── order.entity.ts           # Aggregate Root
│   │   │   │   │   └── order-item.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── order-status.vo.ts        # PENDING|CONFIRMED|SHIPPING|DONE|CANCELLED
│   │   │   │   │   ├── shipping-address.vo.ts
│   │   │   │   │   └── total-amount.vo.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── order-placed.event.ts
│   │   │   │   │   ├── order-confirmed.event.ts
│   │   │   │   │   └── order-cancelled.event.ts
│   │   │   │   └── repositories/
│   │   │   │       └── order.repository.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── place-order/
│   │   │   │   │   │   ├── place-order.command.ts
│   │   │   │   │   │   └── place-order.handler.ts  # Gọi cart domain, tạo order
│   │   │   │   │   ├── confirm-order/
│   │   │   │   │   │   ├── confirm-order.command.ts
│   │   │   │   │   │   └── confirm-order.handler.ts
│   │   │   │   │   └── cancel-order/
│   │   │   │   │       ├── cancel-order.command.ts
│   │   │   │   │       └── cancel-order.handler.ts
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-my-orders/
│   │   │   │   │   │   ├── get-my-orders.query.ts
│   │   │   │   │   │   └── get-my-orders.handler.ts
│   │   │   │   │   └── get-order-detail/
│   │   │   │   │       ├── get-order-detail.query.ts
│   │   │   │   │       └── get-order-detail.handler.ts
│   │   │   │   └── dtos/
│   │   │   │       ├── place-order.dto.ts
│   │   │   │       └── order-response.dto.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   └── persistence/
│   │   │   │       ├── order.orm-entity.ts
│   │   │   │       ├── order-item.orm-entity.ts
│   │   │   │       └── order.repository.impl.ts
│   │   │   │
│   │   │   ├── presentation/
│   │   │   │   └── controllers/
│   │   │   │       └── order.controller.ts       # POST /orders, GET /orders, PATCH /orders/:id
│   │   │   │
│   │   │   └── order.module.ts
│   │   │
│   │   └── admin/                        # 🔧 Domain: Quản trị (cross-cutting)
│   │       ├── application/
│   │       │   └── dtos/
│   │       │       └── admin-stats-response.dto.ts
│   │       ├── presentation/
│   │       │   └── controllers/
│   │       │       ├── admin-product.controller.ts   # Quản lý sản phẩm
│   │       │       ├── admin-order.controller.ts     # Quản lý đơn hàng
│   │       │       └── admin-user.controller.ts      # Quản lý người dùng
│   │       └── admin.module.ts
│   │
│   ├── shared/                           # 🔗 Shared Kernel (dùng chung giữa các domain)
│   │   ├── domain/
│   │   │   ├── base-entity.ts            # Base class cho tất cả Entity
│   │   │   ├── base-aggregate.ts         # Base class cho Aggregate Root
│   │   │   ├── base-value-object.ts      # Base class cho Value Object
│   │   │   └── domain-event.ts           # Base interface cho Domain Event
│   │   ├── application/
│   │   │   ├── use-case.interface.ts     # Interface IUseCase<TIn, TOut>
│   │   │   └── pagination.dto.ts         # Phân trang chung
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   └── base.repository.ts    # Abstract repository với TypeORM
│   │   │   └── event-bus/
│   │   │       └── event-bus.service.ts  # EventEmitter2 wrapper
│   │   └── presentation/
│   │       ├── filters/
│   │       │   └── domain-exception.filter.ts  # Bắt DomainException → HTTP response
│   │       ├── interceptors/
│   │       │   └── response-transform.interceptor.ts
│   │       └── decorators/
│   │           ├── current-user.decorator.ts
│   │           └── roles.decorator.ts
│   │
│   ├── config/                           # ⚙️ Cấu hình ứng dụng
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── config.module.ts
│   │
│   ├── app.module.ts                     # Root module
│   └── main.ts                           # Bootstrap NestJS app
│
├── test/
│   ├── unit/
│   │   ├── catalog/
│   │   │   ├── product.entity.spec.ts
│   │   │   └── create-product.handler.spec.ts
│   │   ├── cart/
│   │   │   └── cart.entity.spec.ts
│   │   └── order/
│   │       └── order.entity.spec.ts
│   ├── integration/
│   │   ├── catalog/
│   │   │   └── product.repository.spec.ts
│   │   └── order/
│   │       └── place-order.handler.spec.ts
│   └── e2e/
│       ├── auth.e2e-spec.ts
│       ├── product.e2e-spec.ts
│       └── order.e2e-spec.ts
│
├── database/
│   └── migrations/                       # TypeORM migration files
│
├── docker-compose.yml
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## Giải thích 4 tầng trong mỗi module

```
modules/<domain>/
  ├── domain/          ← Lõi nghiệp vụ: Entity, Value Object, Event, Repository interface
  ├── application/     ← Use case: Command/Query handlers, DTOs (CQRS pattern)
  ├── infrastructure/  ← Kết nối DB: ORM entities, Repository impl, Mapper
  └── presentation/    ← HTTP: Controller, Guard
```

### Quy tắc phụ thuộc (Dependency Rule)

```
presentation → application → domain
infrastructure → domain (implements repository interface)
```

- Domain KHÔNG được import bất kỳ tầng nào khác
- Infrastructure implements interface của domain (Dependency Inversion)

---

## Map từ ASP.NET MVC → NestJS DDD

| ASP.NET (cũ)                             | NestJS DDD (mới)                                              |
| ---------------------------------------- | ------------------------------------------------------------- |
| `Models/Product.cs`                      | `catalog/domain/entities/product.entity.ts`                   |
| `Models/Category.cs`                     | `catalog/domain/entities/category.entity.ts`                  |
| `Models/Order.cs`                        | `order/domain/entities/order.entity.ts`                       |
| `Controllers/HomeController.cs`          | `catalog/presentation/controllers/product.controller.ts`      |
| `Controllers/CartController.cs`          | `cart/presentation/controllers/cart.controller.ts`            |
| `Controllers/OrderController.cs`         | `order/presentation/controllers/order.controller.ts`          |
| `Controllers/AccountController.cs`       | `identity/presentation/controllers/auth.controller.ts`        |
| `Controllers/AdminController.cs`         | `admin/presentation/controllers/admin-*.controller.ts`        |
| `EasyBuyDbContext.cs` (Entity Framework) | `*/infrastructure/persistence/*.orm-entity.ts` (TypeORM)      |
| `Views/` (Razor)                         | → Chuyển sang Frontend riêng (Next.js/React) hoặc giữ Swagger |

---

## Packages cần cài

```bash
# Core
npm install @nestjs/common @nestjs/core @nestjs/platform-express

# CQRS (Command/Query pattern)
npm install @nestjs/cqrs

# Database
npm install @nestjs/typeorm typeorm pg

# Auth
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt

# Config
npm install @nestjs/config

# Validation
npm install class-validator class-transformer

# Dev
npm install -D @nestjs/cli typescript ts-node
```
