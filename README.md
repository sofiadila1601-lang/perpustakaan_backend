# Sistem Perpustakaan Sekolah — REST API

## 1. Deskripsi Proyek

Sistem Perpustakaan Sekolah adalah REST API untuk mengelola data buku, kategori buku, siswa, petugas perpustakaan, dan peminjaman buku. API dibangun menggunakan Node.js, Express.js, dan PostgreSQL.

## 2. Teknologi

- Node.js
- Express.js
- PostgreSQL (Neon)
- Vercel
- Postman

## 3. Database dan Relasi

Database terdiri dari lima tabel:

1. `students` — data siswa.
2. `librarians` — data petugas perpustakaan.
3. `categories` — kategori buku.
4. `books` — data buku.
5. `loans` — transaksi peminjaman buku.

Relasi antartabel:

- `categories.id` → `books.category_id`
- `students.id` → `loans.student_id`
- `books.id` → `loans.book_id`
- `librarians.id` → `loans.librarian_id`

### Diagram ERD

![ERD Sistem Perpustakaan Sekolah](docs/erd-perpustakaan.png)

## 4. URL Deployment

- Base URL: GANTI_DENGAN_URL_VERCEL_KAMU
- Health check: `/health`

## 5. Daftar Endpoint

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/health` | Memeriksa status API |
| GET | `/categories` | Mengambil semua kategori |
| POST | `/categories` | Menambahkan kategori |
| GET | `/books` | Mengambil semua buku |
| GET | `/books/:id` | Mengambil detail buku |
| POST | `/books` | Menambahkan buku |
| PUT | `/books/:id` | Memperbarui buku |
| DELETE | `/books/:id` | Menghapus buku |

## 6. Contoh Request

### Menambahkan kategori

- **Method:** `POST`
- **Endpoint:** `/categories`
- **Header:** `Content-Type: application/json`

Request Body:

```json
{
  "name": "Fiksi",
  "description": "Buku cerita dan novel"
}
```

### Menambahkan buku

- **Method:** `POST`
- **Endpoint:** `/books`
- **Header:** `Content-Type: application/json`

Request Body:

```json
{
  "title": "Laskar Pelangi",
  "author": "Andrea Hirata",
  "isbn": "9789793062792",
  "stock": 10,
  "category_id": 1
}
```

## 7. Cara Menjalankan Secara Lokal

1. Pastikan Node.js sudah terpasang.
2. Clone repository.
3. Jalankan `npm install`.
4. Buat file `.env` dengan `DATABASE_URL` berisi connection string PostgreSQL dan `PORT=3000`.
5. Jalankan `npm.cmd run dev` melalui PowerShell di Windows.
6. Buka `http://localhost:3000/health`.

Jangan unggah file `.env` ke GitHub karena berisi informasi koneksi database.

## 8. Pengujian API

Pengujian dilakukan menggunakan Postman dengan URL deployment Vercel. Bukti pengujian akan dilampirkan dalam bentuk screenshot atau export collection Postman.

## 9. Repository

Link GitHub: https://github.com/sofiadila1601-lang/perpustakaan-backend
