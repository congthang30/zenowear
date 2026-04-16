# ZenoWear — Tài liệu cho Frontend & tổng quan API

Tài liệu mô tả **luồng nghiệp vụ**, **API phân quyền User / Admin**, và **gợi ý màn hình** để team FE triển khai. Base URL mặc định: **`/api/v1`** (cấu hình `GLOBAL_PREFIX` trong env). Swagger: **`/api/v1/docs`**.

---

## 1. Xác thực

- Đăng ký / đăng nhập trả **JWT** (`access token`).
- Các route cần đăng nhập: gửi header **`Authorization: Bearer <token>`**.
- Role trong token: thường là **`USER`** hoặc **`ADMIN`** (một số endpoint chỉ `ADMIN`).

---

## 2. API theo vai trò

### 2.1. Công khai hoặc User (không cần admin)

| Nhóm | Method | Đường dẫn | Ghi chú |
|------|--------|-----------|---------|
| **Auth** | `POST` | `/auth/register` | Đăng ký |
| | `POST` | `/auth/login` | Đăng nhập → `token` |
| | `POST` | `/auth/logout` | JWT |
| | `POST` | `/auth/me/password` | Đổi mật khẩu |
| **User profile** | `GET` | `/users/me` | JWT |
| | `PATCH` | `/users/me` | Cập nhật profile |
| | `PATCH` | `/users/me/avatar` | Avatar (Cloudinary) |
| **Danh mục / thương hiệu (đọc)** | `GET` | `/categories/active` | Cây danh mục dùng cho filter |
| | `GET` | `/categories/tree` | |
| | `GET` | `/categories/:id` | |
| | `GET` | `/brands/active` | |
| | `GET` | `/brands/:id` | |
| **Sản phẩm (storefront)** | `GET` | `/products` | Danh sách / lọc (xem Swagger) |
| | `GET` | `/products/:id` | Chi tiết + variants |
| | `POST` | `/products/:id/views` | Tăng lượt xem (optional) |
| **Giỏ hàng** | `GET` | `/cart` | JWT |
| | `POST` | `/cart/items` | Thêm / cộng dồn |
| | `DELETE` | `/cart/items` | Xóa dòng |
| | `PATCH` | `/cart/items/quantity` | Delta số lượng |
| | `PATCH` | `/cart/items/variant` | Đổi biến thể |
| **Địa chỉ giao hàng** | `GET` | `/addresses` | JWT |
| | `POST` | `/addresses` | |
| | `PATCH` | `/addresses/:id` | |
| | `DELETE` | `/addresses/:id` | |
| **Coupon (user)** | `POST` | `/coupons/validate` | Body: `code`, optional `subtotalAmount` (không gửi thì dùng giỏ) |
| | `POST` | `/coupons/apply-preview` | Áp mã theo **giỏ hiện tại** → `discountAmount`, `finalAmount`, `appliedCoupon` |
| | `GET` | `/coupons/me/usages` | Lịch sử đã dùng mã (`?page=&limit=`) |
| **Đơn hàng** | `POST` | `/orders/preview` | Xem trước tổng tiền + tồn kho; optional `couponCode` / `discountAmount` |
| | `POST` | `/orders` | Tạo đơn từ giỏ; optional `couponCode`, `addressId` **hoặc** `shippingAddress`, thanh toán ONLINE/COD |
| | `GET` | `/orders` | Đơn của tôi (phân trang) |
| | `GET` | `/orders/:id` | Chi tiết (chủ đơn hoặc admin) |
| | `POST` | `/orders/:id/cancel` | Hủy đơn (user) |
| | `POST` | `/orders/:id/retry-online-payment` | Thanh toán lại ONLINE (trong 24h, đơn PENDING) |
| | `PATCH` | `/orders/:id/payment-method` | Đổi COD ↔ ONLINE (trong 24h) |
| **Thanh toán (server)** | `POST` | `/orders/payment/callback` | Webhook cổng (secret header nếu cấu hình); không phải màn FE |

### 2.2. Admin (`JWT` + role `ADMIN`)

| Nhóm | Method | Đường dẫn | Ghi chú |
|------|--------|-----------|---------|
| **Danh mục** | `POST` | `/categories` | CRUD + bật/tắt |
| | `PATCH` | `/categories/:id` | |
| | `DELETE` | `/categories/:id` | |
| | `PATCH` | `/categories/:id/status` | |
| **Thương hiệu** | `POST` | `/brands` | |
| | `PATCH` | `/brands/:id` | |
| | `DELETE` | `/brands/:id` | |
| | `PATCH` | `/brands/:id/status` | |
| **Sản phẩm** | `POST` | `/products` | Tạo SP + variant |
| | `PATCH` | `/products/:id` | |
| | `DELETE` | `/products/:id` | Soft delete |
| | `PATCH` | `/products/:id/status` | |
| | `PATCH` | `/products/:id/featured` | |
| | `POST` | `/products/:id/variants` | |
| | `PATCH` | `/products/:id/variants/:variantId` | |
| | `DELETE` | `/products/:id/variants/:variantId` | |
| **Media** | `POST` | `/media/images` | Upload ảnh |
| **Coupon** | `POST` | `/admin/coupons` | Tạo mã |
| | `PATCH` | `/admin/coupons/:id` | Sửa |
| | `PATCH` | `/admin/coupons/:id/status` | DRAFT / ACTIVE / INACTIVE / EXPIRED |
| **Đơn hàng** | `PATCH` | `/orders/:id/status` | Đổi trạng thái vận hành |
| | `POST` | `/orders/:id/confirm` | Xác nhận đơn |

Chi tiết body/query/response: mở **Swagger** (`/api/v1/docs`) — đây là nguồn chuẩn nhất cho FE.

---

## 3. Luồng nghiệp vụ chính (cách hệ thống hoạt động)

### 3.1. Khách → mua hàng

1. **Đăng nhập** → lưu token.
2. **Duyệt sản phẩm** (`GET /products`, `GET /products/:id`) — chọn `variantId`, giá, tồn.
3. **Thêm giỏ** (`POST /cart/items`).
4. **Giỏ** (`GET /cart`) — chỉnh số lượng / xóa / đổi variant.
5. **Checkout**
   - (Optional) **Sổ địa chỉ** (`GET/POST/PATCH/DELETE /addresses`).
   - **Preview đơn** `POST /orders/preview` — có thể gửi `couponCode` và/hoặc `discountAmount` (khi có mã thì ưu tiên mã).
   - **Nhập mã thử** có thể dùng `POST /coupons/apply-preview` hoặc `validate` để hiển thị tiền giảm trước khi đặt.
6. **Đặt hàng** `POST /orders`:
   - Gửi **`addressId`** (địa chỉ đã lưu) **hoặc** **`shippingAddress`** (nhập mới) — **không** gửi cả hai.
   - **`paymentMethod`**: `COD` hoặc `ONLINE`.
   - **ONLINE**: thêm `onlineGateway` (VNPay/MoMo), `returnUrl`, optional `clientIp`, `ipnUrl`.
   - **Coupon**: optional `couponCode` — giảm giá được tính lại server-side; sau khi tạo đơn thành công hệ thống **ghi nhận usage** (lượt dùng).
7. **Response tạo đơn**: `id`, `message`, và với ONLINE có **`paymentRedirectUrl`** → FE **redirect** user sang cổng thanh toán.
8. User quay lại **`returnUrl`** (FE tự route) — đọc query VNPay/MoMo, gọi lại `GET /orders/:id` để hiển thị trạng thái.
9. **Email**: COD gửi mail đặt hàng ngay; ONLINE gửi mail **sau khi** callback xác nhận thanh toán thành công (nếu SMTP đã cấu hình).

### 3.2. Thanh toán ONLINE thất bại / đổi ý

- Trong **24 giờ**, đơn **PENDING** và chưa **PAID**:
  - **`POST /orders/:id/retry-online-payment`** — lấy link thanh toán mới.
  - **`PATCH /orders/:id/payment-method`** — đổi sang COD hoặc ngược lại (sang ONLINE trả `paymentRedirectUrl`).

### 3.3. Hủy đơn & coupon

- User **`POST /orders/:id/cancel`** — hoàn kho nếu đơn chưa giao.
- Nếu env **`COUPON_RESTORE_ON_CANCEL=true`**: khi hủy, hệ thống **hoàn lượt** coupon (xóa bản ghi usage + giảm `usedCount`). Mặc định env có thể là `false`.

### 3.4. Admin vận hành

- CRUD **danh mục, thương hiệu, sản phẩm**, upload **media**.
- **Coupon**: tạo mã → chuyển **DRAFT → ACTIVE** khi sẵn sàng chạy campaign.
- **Đơn**: đổi trạng thái vận hành, xác nhận đơn theo quy trình nội bộ.

---

## 4. Gợi ý giao diện (FE) — layout & màn hình

Không bắt buộc UI cụ thể; dưới đây là **skeleton** phù hợp API hiện có.

### 4.1. Chung

- **Header**: logo, search sản phẩm, giỏ (badge số dòng), avatar menu (profile / đơn hàng / đăng xuất).
- **Auth**: trang Login / Register; lưu token (memory + refresh strategy tùy team).

### 4.2. Storefront

| Màn hình | Hành vi chính |
|----------|----------------|
| **Trang chủ / PLP** | Gọi `GET /products` + filter category/brand từ `GET /categories/active`, `GET /brands/active`. |
| **PDP (chi tiết SP)** | `GET /products/:id` — chọn variant (SKU, giá, tồn), nút **Thêm giỏ** → `POST /cart/items`. |
| **Giỏ** | `GET /cart` — list dòng; actions gọi PATCH quantity / DELETE / đổi variant. |
| **Checkout** | Form địa chỉ hoặc chọn từ `GET /addresses`; ô **mã giảm giá** gọi `apply-preview` hoặc `validate`; nút **Preview đơn** → `POST /orders/preview`; hiển thị tổng phụ, giảm, thành tiền. |
| **Thanh toán** | Chọn COD vs ONLINE; nếu ONLINE hiển thị chọn VNPay/MoMo + nhập/đặt sẵn `returnUrl`. Submit `POST /orders` → nếu có `paymentRedirectUrl` thì `window.location = url`. |
| **Kết quả thanh toán** | Route FE trùng `returnUrl` — đọc query; gọi `GET /orders/:id`. |
| **Đơn của tôi** | `GET /orders` + trang chi tiết `GET /orders/:id`; nút hủy (nếu được); với ONLINE chưa trả: nút **Thanh toán lại** / **Đổi sang COD**. |
| **Mã đã dùng** | `GET /coupons/me/usages` (trang “Khuyến mãi của tôi”). |

### 4.3. Admin (layout riêng, guard route theo role)

| Khu vực | Chức năng |
|---------|-----------|
| **Dashboard** | Tùy sản phẩm — có thể thống kê sau. |
| **Categories / Brands** | Bảng + form CRUD + toggle status. |
| **Products** | Danh sách; form tạo/sửa; quản lý variants; featured; status. |
| **Coupons** | Bảng mã; form tạo/sửa (loại %, cố định, free ship, min đơn, max giảm, hạn, lượt); nút đổi status. |
| **Orders** | Danh sách (có thể filter theo status); chi tiết; đổi trạng thái / xác nhận. |

### 4.4. Trải nghiệm UX nên nhớ

- Luôn **disable nút đặt hàng** khi đang gọi API; hiển thị lỗi 400 từ server (giỏ trống, mã không hợp lệ, thiếu `returnUrl` ONLINE, v.v.).
- **Coupon**: khi user nhập mã, debounce rồi gọi `apply-preview` để cập nhật dòng “Bạn được giảm …”.
- **Địa chỉ**: radio “Chọn đã lưu” vs “Nhập mới” — chỉ gửi một trong hai cho `POST /orders`.

---

## 5. Biến môi trường liên quan (tham khảo)

- **`GLOBAL_PREFIX`**: mặc định `api/v1`.
- **SMTP**: email xác nhận đơn / thanh toán.
- **VNPay / MoMo**: URL và key sandbox/production.
- **`COUPON_RESTORE_ON_CANCEL`**: `true` / `false`.
- **`PAYMENT_WEBHOOK_SECRET`**: bảo vệ callback thanh toán nếu dùng.

---

## 6. Công nghệ backend (tham khảo nhanh)

- **NestJS** + **MongoDB (Mongoose)**.
- Kiến trúc theo module: Identity, User, Product, Cart, Order, Address, Coupon, Media, …

Nếu cần bổ sung **ví dụ JSON** từng API theo từng màn, có thể yêu cầu thêm file `docs/fe-api-examples.md` riêng theo module.
