# Ảnh quán ăn (embe / Đi ăn)

Đặt ảnh `.jpg`, `.jpeg`, `.png`, `.webp` hoặc `.avif` trực tiếp trong thư mục này.

Ví dụ `quan-chay-an.jpg`. Trong Google Sheets, cột `Ảnh bìa` chỉ ghi `quan-chay-an.jpg`, không thêm đường dẫn hay URL. Cột `Ảnh bổ sung` có thể ghi `mon-1.png|mon-2.jpg` (dấu | ngăn cách nhiều ảnh).

Tên file nên viết thường, không dấu, không khoảng trắng; tên file phải trùng chính xác với Sheet, phân biệt chữ hoa/thường trên hosting Linux. Đừng chèn `/`, `..` hay URL ngoài vào ô ảnh. Có thể nén ảnh trước khi commit lên Vercel/GitHub để web tải nhanh.

**Lưu ý:** Chỉnh nội dung Sheet tự cập nhật trang sau khoảng 2 phút cache + thời gian Google xuất bản dữ liệu. Nhưng thêm/sửa ảnh ở folder phải commit và deploy lại website. File CSV không thể tải ảnh từ máy của bạn lên server.
