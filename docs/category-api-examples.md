# Category API — ví dụ request / response

Base URL mẫu: `http://localhost:3000` (thay bằng URL thực tế). Tiền tố: `/categories`.

Các endpoint **admin** cần header: `Authorization: Bearer <JWT>` và role `ADMIN`.

---

## 1. Tạo danh mục

`POST /categories`

**Request**

```http
POST /categories HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Điện thoại",
  "parentId": "507f191e810c19729de860ea",
  "status": "DRAFT"
}
```

**Response** `201 Created`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "message": "Tạo danh mục thành công."
}
```

---

## 2. Cập nhật danh mục

`PATCH /categories/:id`

**Request**

```http
PATCH /categories/507f1f77bcf86cd799439011 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Điện thoại thông minh",
  "parentId": null
}
```

**Response** `204 No Content` (không body)

---

## 3. Xóa mềm (đặt INACTIVE)

`DELETE /categories/:id`

**Request**

```http
DELETE /categories/507f1f77bcf86cd799439011 HTTP/1.1
Authorization: Bearer <token>
```

**Response** `204 No Content`

---

## 4. Đổi trạng thái

`PATCH /categories/:id/status`

**Request**

```http
PATCH /categories/507f1f77bcf86cd799439011/status HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

**Response** `204 No Content`

Lỗi `400` khi chuyển `ACTIVE` mà cha không tồn tại hoặc không `ACTIVE` (nếu có `parentId`).

---

## 5. Lấy tất cả danh mục ACTIVE

`GET /categories/active`

**Request**

```http
GET /categories/active HTTP/1.1
```

**Response** `200 OK`

```json
[
  {
    "id": "507f191e810c19729de860ea",
    "name": "điện tử",
    "parentId": null,
    "status": "ACTIVE"
  },
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "điện thoại",
    "parentId": "507f191e810c19729de860ea",
    "status": "ACTIVE"
  }
]
```

---

## 6. Lấy danh mục theo id (chỉ ACTIVE)

`GET /categories/:id`

**Request**

```http
GET /categories/507f1f77bcf86cd799439011 HTTP/1.1
```

**Response** `200 OK`

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "điện thoại",
  "parentId": "507f191e810c19729de860ea",
  "status": "ACTIVE"
}
```

Nếu không tồn tại hoặc không `ACTIVE`: `404 Not Found`.

---

## 7. Cây danh mục ACTIVE

`GET /categories/tree`

**Request**

```http
GET /categories/tree HTTP/1.1
```

**Response** `200 OK`

```json
[
  {
    "id": "507f191e810c19729de860ea",
    "name": "điện tử",
    "parentId": null,
    "status": "ACTIVE",
    "children": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "điện thoại",
        "parentId": "507f191e810c19729de860ea",
        "status": "ACTIVE",
        "children": []
      }
    ]
  }
]
```

---

## Giá trị `status`

`DRAFT` | `ACTIVE` | `INACTIVE` | `ARCHIVED`
