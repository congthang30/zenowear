# Brand API — ví dụ request / response

Base URL mẫu: `http://localhost:3000`. Tiền tố: `/brands`.

Các endpoint **admin** cần `Authorization: Bearer <JWT>` và role `ADMIN`.

Trường `name` trong JSON là tên hiển thị nhập vào; hệ thống chuẩn hóa (trim, chữ thường NFC) để kiểm tra **trùng tên** — hai tên chỉ khác hoa thường được coi là một.

---

## 1. Tạo thương hiệu

`POST /brands`

**Request**

```http
POST /brands HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Samsung",
  "logo": "https://cdn.example.com/brands/samsung.png",
  "description": "Thương hiệu điện tử",
  "status": "DRAFT"
}
```

**Response** `201 Created`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "message": "Tạo thương hiệu thành công."
}
```

**Lỗi** `409 Conflict` — `{ "statusCode": 409, "message": "Tên thương hiệu đã tồn tại" }`

---

## 2. Cập nhật thương hiệu

`PATCH /brands/:id`

**Request**

```http
PATCH /brands/507f1f77bcf86cd799439011 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Samsung Electronics",
  "logo": null,
  "description": "Cập nhật mô tả"
}
```

**Response** `204 No Content`

---

## 3. Xóa mềm (INACTIVE)

`DELETE /brands/:id`

**Request**

```http
DELETE /brands/507f1f77bcf86cd799439011 HTTP/1.1
Authorization: Bearer <token>
```

**Response** `204 No Content`

---

## 4. Đổi trạng thái

`PATCH /brands/:id/status`

**Request**

```http
PATCH /brands/507f1f77bcf86cd799439011/status HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

**Response** `204 No Content`

---

## 5. Danh sách ACTIVE

`GET /brands/active`

**Request**

```http
GET /brands/active HTTP/1.1
```

**Response** `200 OK`

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "samsung",
    "logo": "https://cdn.example.com/brands/samsung.png",
    "description": "Thương hiệu điện tử",
    "status": "ACTIVE"
  }
]
```

---

## 6. Chi tiết theo id (chỉ ACTIVE)

`GET /brands/:id`

**Request**

```http
GET /brands/507f1f77bcf86cd799439011 HTTP/1.1
```

**Response** `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "samsung",
  "logo": "https://cdn.example.com/brands/samsung.png",
  "description": "Thương hiệu điện tử",
  "status": "ACTIVE"
}
```

Không tồn tại hoặc không `ACTIVE`: `404 Not Found`.

---

## `status`

`DRAFT` | `ACTIVE` | `INACTIVE` | `ARCHIVED`
