# Product API — ví dụ request / response

Base: `http://localhost:3000/products`. Các thao tác ghi (trừ tăng view) cần `Authorization: Bearer <JWT>` role **ADMIN** (trừ khi ghi chú khác).

Trạng thái sản phẩm: `ACTIVE` | `INACTIVE` | `OUT_OF_STOCK` (`OUT_OF_STOCK` do hệ thống đặt khi mọi biến thể còn lại có `stock = 0`).

---

## 1. Tạo sản phẩm + biến thể

`POST /products` — `multipart/form-data`

- `data`: chuỗi JSON theo schema `CreateProductDto` (có `variants`, đúng **một** `isDefault: true`, mỗi biến thể ≥ 1 `attributes`, `price` ≤ `originalPrice`, SKU/barcode/slug unique).
- `images`: file ảnh tùy chọn (upload Cloudinary).

**JSON trong `data` (rút gọn)**

```json
{
  "productName": "Áo thun nam",
  "barcode": "8935244800001",
  "description": "Cotton 100%",
  "brandId": "507f1f77bcf86cd799439011",
  "categoryId": "507f191e810c19729de860ea",
  "images": ["https://cdn.example.com/a.jpg"],
  "videoUrl": "https://youtube.com/watch?v=abc",
  "variants": [
    {
      "sku": "AO-NAM-S-001",
      "attributes": [{ "key": "Size", "value": "S" }],
      "originalPrice": 200000,
      "price": 159000,
      "stock": 50,
      "isDefault": true
    },
    {
      "sku": "AO-NAM-M-001",
      "attributes": [{ "key": "Size", "value": "M" }],
      "originalPrice": 200000,
      "price": 159000,
      "stock": 0,
      "isDefault": false
    }
  ]
}
```

**Response** `201`

```json
{
  "id": "674a1b2c3d4e5f6789012345",
  "message": "Tạo sản phẩm thành công."
}
```

---

## 2. Cập nhật sản phẩm

`PATCH /products/:id` — JSON

```http
PATCH /products/674a1b2c3d4e5f6789012345 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "productName": "Áo thun nam premium",
  "slug": "ao-thun-nam-premium",
  "tags": ["áo", "nam"],
  "videoUrl": null
}
```

**Response** `204 No Content`

---

## 3. Xóa mềm sản phẩm

`DELETE /products/:id` — đặt `deletedAt` + `status: INACTIVE`

**Response** `204`

---

## 4. Đổi trạng thái sản phẩm

`PATCH /products/:id/status`

```json
{ "status": "ACTIVE" }
```

Không gửi `OUT_OF_STOCK` (hệ thống tự cập nhật theo tồn kho).

**Response** `204`

---

## 5. Chi tiết sản phẩm (kèm biến thể)

`GET /products/:id` — chỉ **ACTIVE**, chưa xóa mềm.

**Response** `200`

```json
{
  "id": "674a1b2c3d4e5f6789012345",
  "productName": "áo thun nam",
  "slug": "ao-thun-nam",
  "barcode": "8935244800001",
  "description": "Cotton 100%",
  "status": "ACTIVE",
  "isFeatured": false,
  "viewCount": 12,
  "totalSold": 0,
  "ratingAverage": 0,
  "reviewCount": 0,
  "ratingTotal": 0,
  "tags": [],
  "brandId": "507f1f77bcf86cd799439011",
  "categoryId": "507f191e810c19729de860ea",
  "images": ["https://cdn.example.com/a.jpg"],
  "videoUrl": "https://youtube.com/watch?v=abc",
  "deletedAt": null,
  "variants": [
    {
      "id": "674a1b2c3d4e5f6789012999",
      "productId": "674a1b2c3d4e5f6789012345",
      "sku": "AO-NAM-S-001",
      "attributes": [{ "key": "Size", "value": "S" }],
      "originalPrice": 200000,
      "price": 159000,
      "stock": 50,
      "isDefault": true,
      "images": []
    }
  ]
}
```

---

## 6. Danh sách + phân trang + lọc

`GET /products?page=1&limit=20&search=áo&brandId=...&categoryId=...&minPrice=100000&maxPrice=500000&catalogOnly=true`

- `catalogOnly=true` (mặc định): chỉ `ACTIVE`, chưa xóa mềm.
- `minPrice` / `maxPrice`: theo **giá bán tối thiểu** trong các biến thể còn hiệu lực (không xóa mềm).

**Response** `200`

```json
{
  "data": [
    {
      "id": "674a1b2c3d4e5f6789012345",
      "productName": "áo thun nam",
      "slug": "ao-thun-nam",
      "barcode": "8935244800001",
      "description": "Cotton 100%",
      "status": "ACTIVE",
      "isFeatured": false,
      "viewCount": 12,
      "totalSold": 0,
      "ratingAverage": 0,
      "reviewCount": 0,
      "ratingTotal": 0,
      "tags": [],
      "brandId": "507f1f77bcf86cd799439011",
      "categoryId": "507f191e810c19729de860ea",
      "images": [],
      "deletedAt": null
    }
  ],
  "total": 1
}
```

---

## 7. Thêm biến thể

`POST /products/:id/variants`

```json
{
  "sku": "AO-NAM-L-001",
  "attributes": [{ "key": "Size", "value": "L" }],
  "originalPrice": 200000,
  "price": 159000,
  "stock": 20,
  "isDefault": false
}
```

**Response** `201`

```json
{
  "id": "674a1b2c3d4e5f6789012888",
  "message": "Đã thêm biến thể."
}
```

---

## 8. Cập nhật biến thể

`PATCH /products/:id/variants/:variantId`

```json
{
  "stock": 10,
  "price": 149000,
  "originalPrice": 200000
}
```

**Response** `204`

---

## 9. Xóa biến thể (soft delete)

`DELETE /products/:id/variants/:variantId`

**Response** `204`

---

## 10. Đánh dấu nổi bật

`PATCH /products/:id/featured`

```json
{ "isFeatured": true }
```

**Response** `204`

---

## 11. Tăng lượt xem

`POST /products/:id/views` — không cần JWT; chỉ tăng khi sản phẩm **ACTIVE** và chưa xóa mềm.

**Response** `204` hoặc `404` nếu không hợp lệ.

---

## Quy tắc đã áp dụng (tóm tắt)

| Quy tắc | Cách xử lý |
|----------|------------|
| Slug / barcode / SKU unique | Kiểm tra DB (+ index); slug trùng khi tạo có thể tự hậu tố ngẫu nhiên |
| Một biến thể mặc định | Validate khi tạo; khi thêm/sửa/xóa đồng bộ `isDefault` |
| `price` ≤ `originalPrice`, `stock` ≥ 0 | Domain + VO |
| Hết hàng toàn bộ biến thể | `status` → `OUT_OF_STOCK` (trừ `INACTIVE` cố định) |
| Chỉ ACTIVE cho user | `GET` chi tiết / danh sách mặc định / tăng view |
