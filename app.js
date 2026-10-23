
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint utama
app.get("/", (req, res) => {
  res.json({
    message: "API Sistem Perpustakaan Sekolah aktif!",
    status: "success",
  });
});

// Pemeriksaan server dan database
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ error: "Database tidak terhubung" });
  }
});

// GET semua buku
app.get("/books", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT books.*, categories.name AS category_name
      FROM books
      JOIN categories ON books.category_id = categories.id
      ORDER BY books.id
    `);

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
});

 // GET semua kategori
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY id"
    );

    res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Gagal mengambil data kategori",
    });
  }
});

// POST menambahkan kategori
app.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "Nama kategori wajib diisi",
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), description || null]
    );

    res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Nama kategori sudah digunakan",
      });
    }

    console.error(error.message);
    res.status(500).json({
      error: "Gagal menambahkan kategori",
    });
  }
});


// GET satu buku
app.get("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "ID buku tidak valid" });
    }

    const result = await pool.query(
      `SELECT * FROM books WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Buku tidak ditemukan" });
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
});

// POST menambahkan buku
app.post("/books", async (req, res) => {
  try {
    const { title, author, isbn, stock = 0, category_id } = req.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof author !== "string" || !author.trim() ||
      !Number.isInteger(stock) || stock < 0 ||
      !Number.isInteger(category_id) || category_id < 1
    ) {
      return res.status(400).json({
        error: "title, author, stock (bilangan bulat >= 0), dan category_id (bilangan bulat positif) harus valid",
      });
    }

    const result = await pool.query(
      `INSERT INTO books (title, author, isbn, stock, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title.trim(), author.trim(), isbn || null, stock, category_id]
    );

    res.status(201).json({
      message: "Buku berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "Kategori buku tidak ditemukan" });
    }

    if (error.code === "23505") {
      return res.status(409).json({ error: "ISBN sudah digunakan" });
    }

    console.error(error.message);
    res.status(500).json({ error: "Gagal menambahkan buku" });
  }
});

// PUT mengubah seluruh data buku
app.put("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, author, isbn, stock, category_id } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "ID buku tidak valid" });
    }

    if (
      typeof title !== "string" || !title.trim() ||
      typeof author !== "string" || !author.trim() ||
      !Number.isInteger(stock) || stock < 0 ||
      !Number.isInteger(category_id) || category_id < 1
    ) {
      return res.status(400).json({
        error: "title, author, stock, dan category_id wajib diisi dengan nilai valid",
      });
    }

    const result = await pool.query(
      `UPDATE books
       SET title = $1, author = $2, isbn = $3,
           stock = $4, category_id = $5
       WHERE id = $6
       RETURNING *`,
      [title.trim(), author.trim(), isbn || null, stock, category_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Buku tidak ditemukan" });
    }

    res.status(200).json({
      message: "Buku berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "Kategori buku tidak ditemukan" });
    }

    if (error.code === "23505") {
      return res.status(409).json({ error: "ISBN sudah digunakan" });
    }

    console.error(error.message);
    res.status(500).json({ error: "Gagal memperbarui buku" });
  }
});

// DELETE menghapus buku
app.delete("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "ID buku tidak valid" });
    }

    const result = await pool.query(
      `DELETE FROM books WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Buku tidak ditemukan" });
    }

    res.status(200).json({ message: "Buku berhasil dihapus" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        error: "Buku tidak dapat dihapus karena memiliki riwayat peminjaman",
      });
    }

    console.error(error.message);
    res.status(500).json({ error: "Gagal menghapus buku" });
  }
});

// Menangani JSON yang tidak valid
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Format JSON tidak valid" });
  }

  next(error);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
