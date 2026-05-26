# **Dokumen Spesifikasi Teknis: Hyperscale Translation Memory & AST Delta Ingestion Pipeline**

Sistem ini dirancang untuk menyelesaikan tantangan lokalisasi konten dinamis skala besar (RSS feeds, API eksternal) pada **LifeBloom Hub** secara gratis (*zero-cost*), instan (*ultra-low latency*), ramah SEO (*100% Server-Side Rendered*), dan aman dari pemutusan layanan pihak ketiga (*fault-tolerant*).

## **1\. PRODUCT REQUIREMENT DOCUMENT (PRD)**

### **1.1 Ringkasan Eksekutif**

LifeBloom Hub mengonsumsi ribuan artikel dinamis setiap hari dari berbagai umpan berita (*news feeds*). Mengandalkan API komersial (Google Translate/DeepL) untuk volume ini akan memakan biaya ribuan dolar per bulan. Sementara itu, menggunakan *widget* translatos sisi klien (seperti GTranslate) merusak performa SEO, memicu *hydration mismatch* pada React 19, dan sering kali tersembunyi/tidak responsif.

Dokumen ini menetapkan spesifikasi fungsional untuk mesin pemrosesan bahasa yang memecah konten HTML menjadi unit semantik atomik (*AST Delta Engine*), mencari kecocokan memori lokal (*Translation Memory*), dan hanya menerjemahkan bagian yang benar-benar baru secara terdistribusi di sisi server sebelum disimpan ke basis data.

### **1.2 Masalah Utama (Problem Statements)**

1. **Hydration Conflict:** Manipulasi DOM langsung oleh pustaka translasi klien bertentangan dengan Virtual DOM React 19\.  
2. **Infinite Cost Scale:** Biaya API komersial linier terhadap pertumbuhan konten.  
3. **SEO Loss:** Mesin pencari (Googlebot) tidak mengindeks hasil terjemahan yang dibuat secara dinamis di browser pengguna.  
4. **Duplicate Compute:** Banyak konten RSS yang berulang (hanya beda judul, tanggal, atau satu paragraf pembaruan), namun sistem lama menerjemahkan ulang seluruh artikel.

### **1.3 Spesifikasi Fungsional (Functional Requirements)**

* **FR-01 (AST Parsing):** Sistem harus mampu mengurai HTML artikel menjadi array objek berstruktur data pohon (*Abstract Syntax Tree* / AST) yang memisahkan tag pembungkus dengan teks murni.  
* **FR-02 (Deterministic Hashing):** Setiap teks blok atomik (paragraf, daftar, judul) harus menghasilkan *hash* SHA-256 yang unik dan konsisten setelah dinormalisasi (menghapus spasi ganda, tag kosong, dan huruf kapital).  
* **FR-03 (Translation Memory Cache):** Sebelum mengirim ke mesin AI, sistem harus mencocokkan *hash* tersebut ke Upstash Redis (*hot storage*) dan database Supabase (*cold storage*).  
* **FR-04 (Multi-Tier Translation Routing):** Jika terjadi *cache-miss*, sistem harus mengantrekan teks ke broker penerjemah multi-tier (Tier 1: Groq LLM Batch, Tier 2: Cloudflare Workers AI, Tier 3: Lingva Proxy Pool).  
* **FR-05 (AST Reconstruction):** Blok teks yang berhasil diterjemahkan harus digabungkan kembali ke dalam struktur HTML aslinya tanpa merusak atribut kelas, gaya, atau tautan asli.  
* **FR-06 (SSR SEO Delivery):** Konten yang telah dimaterialisasi harus disimpan dalam tabel terlokalisasi agar Next.js ISR (*Incremental Static Regeneration*) dapat menayangkannya sebagai HTML statis murni.

### **1.4 Spesifikasi Non-Fungsional (Non-Functional Requirements)**

* **NFR-01 (Latency):** Waktu respon untuk pembacaan halaman statis terjemahan (SSR) harus \< 150ms (menggunakan cache database).  
* **NFR-02 (Compute Zero-Cost Boundary):** Biaya operasional penerjemahan untuk 10.000 artikel/hari tidak boleh melebihi $10/bulan (dengan memaksimalkan *free tiers* dan efisiensi deduplikasi).  
* **NFR-03 (Fault Tolerance):** Jika semua layanan penerjemah mati, sistem harus kembali (*fail-silent*) ke bahasa Inggris asli secara mulus tanpa menghentikan *ingestion process*.

### **1.5 Alur Arsitektur Sistem (System Data Flow)**

\[ Ingestion: RSS / API Feed \]  
              │  
              ▼  
\[ AST Parser: Pecah HTML ke Blok Semantik \]  
              │  
              ▼  
\[ Normalizer: Hapus Kapitalisasi & Spasi \]  
              │  
              ▼  
\[ SHA-256 Hasher: Buat Kunci Unik per Blok \]  
              │  
              ▼  
   ┌───────────────────────┐  
   │ Upstash Redis MGET    │ ──► HIT (95%) ──► Gabung HTML ──► Simpan DB (Sukses)  
   └───────────────────────┘  
              │ MISS  
              ▼  
   ┌───────────────────────┐  
   │ Supabase DB Lookup    │ ──► HIT ──► Simpan ke Redis Cache ──► Gabung HTML  
   └───────────────────────┘  
              │ MISS (Data Benar-Benar Baru)  
              ▼  
   ┌───────────────────────────────┐  
   │ Multi-Tier Broker Translation │ ──► Batched Translation (Groq/CF/Lingva)  
   └───────────────────────────────┘  
              │  
              ▼  
\[ Simpan Hasil ke DB & Redis \] ──► \[ Rekonstruksi HTML \] ──► \[ ISR Static Page Rebuild \]

## **2\. ENTITY RELATIONSHIP DIAGRAM (ERD)**

Sistem ini memisahkan data artikel mentah (*canonical source*) dengan memori hasil translasi (*translation memory*) di level database untuk memastikan normalisasi data 3NF.

### **2.1 Skema Relasi Database (Supabase Postgres)**

erDiagram  
    canonical\_articles ||--o{ translated\_articles : "has translation"  
    translation\_memory ||--o{ translated\_blocks : "materializes"

    canonical\_articles {  
        uuid id PK  
        string source\_hash UK "SHA-256 of raw URL \+ updated timestamp"  
        string title "Original English Title"  
        text content\_html "Original English Full HTML"  
        timestamp ingested\_at  
    }

    translation\_memory {  
        string text\_hash PK "SHA-256 of normalized English block"  
        text original\_text "Original English string segment"  
        timestamp created\_at  
    }

    translated\_blocks {  
        string text\_hash PK, FK "References translation\_memory(text\_hash)"  
        string locale PK "id | es | de | fr"  
        text translated\_text "Localized string segment"  
        string provider\_used "groq | cloudflare | lingva"  
        timestamp updated\_at  
    }

    translated\_articles {  
        uuid id PK  
        uuid article\_id FK "References canonical\_articles(id)"  
        string locale PK "id | es | de | fr"  
        string title\_translated "Localized Title"  
        text content\_html\_translated "Fully reconstructed localized HTML"  
        timestamp compiled\_at  
        UNIQUE\_KEY unique\_article\_locale "article\_id, locale"  
    }

### **2.2 Spesifikasi Kolom Basis Data (Supabase SQL)**

\-- Mengaktifkan ekstensi yang diperlukan  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\-- 1\. Tabel Artikel Kanonis (Sumber Asli Bahasa Inggris)  
CREATE TABLE public.canonical\_articles (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    source\_hash VARCHAR(64) UNIQUE NOT NULL,  
    title TEXT NOT NULL,  
    content\_html TEXT NOT NULL,  
    ingested\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

\-- 2\. Tabel Kamus Induk (Translation Memory)  
CREATE TABLE public.translation\_memory (  
    text\_hash VARCHAR(64) PRIMARY KEY,  
    original\_text TEXT NOT NULL,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

\-- 3\. Tabel Blok Terjemahan (Tingkat Segmen Bahasa)  
CREATE TABLE public.translated\_blocks (  
    text\_hash VARCHAR(64) REFERENCES public.translation\_memory(text\_hash) ON DELETE CASCADE,  
    locale VARCHAR(5) NOT NULL,  
    translated\_text TEXT NOT NULL,  
    provider\_used VARCHAR(50) NOT NULL,  
    updated\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,  
    PRIMARY KEY (text\_hash, locale)  
);

\-- 4\. Tabel Hasil Kompilasi Artikel Terlokalisasi (Tingkat Halaman / SSR)  
CREATE TABLE public.translated\_articles (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    article\_id UUID REFERENCES public.canonical\_articles(id) ON DELETE CASCADE,  
    locale VARCHAR(5) NOT NULL,  
    title\_translated TEXT NOT NULL,  
    content\_html\_translated TEXT NOT NULL,  
    compiled\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,  
    CONSTRAINT unique\_article\_locale UNIQUE (article\_id, locale)  
);

\-- Indexing untuk optimasi query pembacaan SSR Next.js  
CREATE INDEX idx\_translated\_articles\_lookup ON public.translated\_articles(article\_id, locale);  
CREATE INDEX idx\_translated\_blocks\_lookup ON public.translated\_blocks(text\_hash, locale);

### **2.3 Skema Caching (Upstash Redis Mappings)**

Untuk menghindari latensi pembacaan database saat proses *ingestion* atau rekonstruksi halaman, data segmen disimpan dalam Upstash Redis dengan tipe data **String** sederhana yang sangat efisien:

* **Kunci Cache:** tr:{locale}:{SHA-256\_hash\_dari\_teks\_inggris}  
* **Nilai Cache:** Teks Terjemahan Hasil Kompilasi  
* **Kebijakan Penggusuran (TTL):** 2592000 detik (30 Hari). Otomatis diperbarui (*extended*) saat terjadi pembacaan berulang (*sliding expiration*).

## **3\. DOKUMENTASI UI / UX SPECIFICATION**

Prinsip desain antarmuka lokalisasi LifeBloom Hub mengacu pada **Organic Minimalist / Warm Cream (\#FFFDF5)** yang bebas dari gangguan visual (*anti-clutter*), ramah aksesibilitas (*A11Y*), dan berlatensi instan.

### **3.1 Alur Pengguna (User Flow)**

\[ Pengguna Masuk Halaman Utama (/) \]  
                │  
                ├─► Middleware mendeteksi header bahasa peramban (atau GeoIP)  
                ▼  
\[ Redirect Otomatis ke Rute Lokal (Contoh: /id) \]  
                │  
                ├─► Next.js mengambil HTML statis terlokalisasi dari Supabase (SSR)  
                ▼  
\[ Konten Tampil Instan (Tanpa Kedipan Translasi/Page Shift) \]  
                │  
                ├─► Pengguna mengklik "Language Switcher" di Navbar  
                ▼  
\[ Ubah URL ke Prefix Lain (/es) via Router.push() \]  
                │  
                ▼  
\[ Halaman Memuat Ulang Instan (SSR) Tanpa Memicu Crash Hydration \]

### **3.2 Komponen Selektor Bahasa (The Language Switcher)**

Desain selektor bahasa diletakkan pada Navbar bagian kanan menggunakan token desain Pebble Card:

* **Visual Tokens:**  
  * Latar belakang: Putih bersih (\#FFFFFF).  
  * Bingkai (*Border*): Tipis warna krem lembut (\#F3EFE0).  
  * Efek Bayangan: shadow-soft-ambient.  
  * Radius Sudut: Bulat penuh (rounded-full).  
  * Target Interaktif Sisi Sentuh: **min-h-\[52px\]** dan **min-w-\[52px\]** untuk menjamin keramahan motorik bagi lansia.  
* **Perilaku UX (Interaction & States):**  
  * **Default State:** Menampilkan inisial bahasa saat ini dengan ikon globe minimalis (Contoh: 🌐 ID atau 🌐 EN).  
  * **Hover/Focus State:** Latar belakang bertransisi halus ke Warm Cream (\#FFFDF5), border menebal secara organik.  
  * **Dropdown Expanded:** Muncul di bawah tombol utama dengan animasi *soft fade-in*. Berisi daftar bahasa yang didukung (English, Bahasa Indonesia, Español, Deutsch, Français) dengan jarak baris yang lapang (*large vertical spacing*) untuk mencegah salah ketuk (*misclick*).

### **3.3 Penanganan Kasus Khusus (Edge Cases & Accessibility UI)**

#### **A. Banner Keterangan "AI-Translated Content" (Transparansi E-E-A-T)**

Jika konten artikel diterjemahkan menggunakan *pipeline* asinkron (bukan terjemahan manual pakar), sebuah lencana (*badge*) informasi harus ditampilkan di atas artikel:

* **Desain UI:**  
  * Komponen pembungkus: PebbleCard tipis.  
  * Warna teks: Abu-abu hangat (text-warm-gray-700).  
  * Ukuran teks: text-sm (Atkinson Hyperlegible).  
  * Isi pesan:🇮🇩 *"Artikel ini diterjemahkan secara otomatis oleh sistem kecerdasan buatan untuk membantu pemahaman Anda. \[Lihat versi asli bahasa Inggris\]"*  
    🇪🇸 *"Este artículo ha sido traducido automáticamente por nuestro sistema de IA. \[Ver versión original en inglés\]"*

#### **B. Fallback Teks Dinamis**

Jika sebuah blok teks gagal diterjemahkan oleh seluruh tier (Circuit Breaker terbuka), sistem akan menayangkan teks asli bahasa Inggris.

* **Aturan UX:** Teks tersebut **tidak boleh diberi tanda error atau dibiarkan kosong**. Berikan transisi visual halus (misal: warna teks dibuat sedikit lebih redup) untuk menandakan konten tersebut adalah konten asli yang belum terjemah, tanpa mengganggu estetika halaman secara keseluruhan.

## **4\. PENJABARAN RENCANA PELAKSANAAN (ACTION PLAN)**

Sistem ini siap dideploy dengan urutan eksekusi berikut:

1. **Migrasi SQL:** Jalankan berkas migrasi database Supabase di atas untuk membangun tabel-tabel terjemahan.  
2. **Setup File Adapter:** Integrasikan kode translationAdapter.ts yang bersih, aman, dan tanpa bias ke dalam direktori layanan.  
3. **Penyambungan Cron:** Hubungkan adapter tersebut ke skrip rssService.ts Anda agar data yang masuk otomatis terlokalisasi di balik layar.