/**
 * Query = “câu hỏi” chỉ mang input đọc dữ liệu, không có side effect.
 * Handler sẽ dùng userId để gọi repository.
 */
export class GetMyProfileQuery {
  constructor(readonly userId: string) {}
}
