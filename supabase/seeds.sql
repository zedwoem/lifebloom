-- Seeds for LifeBloom Hub Support Documents
-- Populates terms, privacy, and knowledge base with premium, production-ready bilingual content

INSERT INTO public.support_documents (slug, title, content) VALUES
(
  'terms', 
  'Terms of Service & Syarat Ketentuan', 
  '# Terms of Service / Syarat dan Ketentuan

Welcome to LifeBloom Hub. Please read these Terms of Service carefully before using our platform. By accessing or using any part of the service, you agree to be bound by these terms.

Selamat datang di LifeBloom Hub. Harap baca Syarat dan Ketentuan ini dengan saksama sebelum menggunakan platform kami. Dengan mengakses atau menggunakan bagian mana pun dari layanan kami, Anda setuju untuk terikat oleh ketentuan ini.

---

## 1. Acceptance of Terms / Penerimaan Ketentuan
### English
By creating an account or using the LifeBloom Hub services, including our financial calculators, wellness metrics, and dynamic content features, you agree to these Terms. If you do not agree, you must not use our services.
### Bahasa Indonesia
Dengan membuat akun atau menggunakan layanan LifeBloom Hub, termasuk kalkulator keuangan, metrik kesehatan, dan fitur konten dinamis kami, Anda menyetujui Ketentuan ini. Jika Anda tidak setuju, Anda tidak diperkenankan menggunakan layanan kami.

## 2. No Professional Advice / Bukan Saran Profesional
### English
All calculations, estimators, and articles provided on LifeBloom Hub are for informational and educational purposes only. They do not constitute professional medical, financial, tax, or legal advice. Always coordinate claiming strategies and health decisions with a certified practitioner or licensed advisor.
### Bahasa Indonesia
Semua perhitungan, estimasi, dan artikel yang disediakan di LifeBloom Hub hanya untuk tujuan informasi dan edukasi. Konten tersebut bukan merupakan saran medis, keuangan, pajak, atau hukum profesional. Selalu koordinasikan strategi klaim dan keputusan kesehatan dengan praktisi bersertifikat atau penasihat berlisensi.

## 3. Account Responsibility / Tanggung Jawab Akun
### English
You are responsible for maintaining the security of your account and any activities that occur under your session. Notify us immediately if you suspect any unauthorized access.
### Bahasa Indonesia
Anda bertanggung jawab untuk menjaga keamanan akun Anda dan setiap aktivitas yang terjadi selama sesi Anda. Segera hubungi kami jika Anda mencurigai adanya akses yang tidak sah.

## 4. Limitation of Liability / Batasan Tanggung Jawab
### English
LifeBloom Hub and its team shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our tools, calculators, or curated database.
### Bahasa Indonesia
LifeBloom Hub dan timnya tidak bertanggung jawab atas kerugian langsung, tidak langsung, tidak sengaja, atau konsekuensial yang dihasilkan dari penggunaan atau ketidakmampuan menggunakan alat, kalkulator, atau basis data terkurasi kami.

## 5. Amendments / Perubahan Ketentuan
### English
We reserve the right to modify these terms at any time. Your continued use of the platform constitutes acceptance of the updated terms.
### Bahasa Indonesia
Kami berhak mengubah ketentuan ini kapan saja. Penggunaan platform yang berkelanjutan setelah perubahan menandakan persetujuan Anda terhadap ketentuan yang diperbarui.'
),
(
  'privacy', 
  'Privacy Policy & Kebijakan Privasi', 
  '# Privacy Policy / Kebijakan Privasi

At LifeBloom Hub, your privacy is our core priority. We build tools for those who depend on you, and we do it with an absolute commitment to data security and user confidentiality.

Di LifeBloom Hub, privasi Anda adalah prioritas utama kami. Kami membangun alat untuk mereka yang bergantung pada Anda, dan kami melakukannya dengan komitmen mutlak terhadap keamanan data dan kerahasiaan pengguna.

---

## 1. Data Collection / Pengumpulan Data
### English
* **Personal Data:** We collect minimal data (such as email) when you register via Magic Link or Google OAuth to manage your preferences, saved calculations, and Bloom Points.
* **Calculations:** Any parameters entered into our calculators (e.g., Smart Home Matcher, Budget Renovator, Drug Interaction Checker) are processed to show results and optionally saved to your private calculation history. We do not sell this input data.
* **No Third-Party Cookies:** We do not sell cookies or monetize your personal health and financial profiles to ad networks.

### Bahasa Indonesia
* **Data Pribadi:** Kami mengumpulkan data minimal (seperti email) saat Anda mendaftar melalui Magic Link atau Google OAuth untuk mengelola preferensi, riwayat perhitungan, dan Bloom Points Anda.
* **Perhitungan:** Parameter apa pun yang dimasukkan ke dalam kalkulator kami diproses untuk menampilkan hasil dan dapat disimpan di riwayat akun pribadi Anda. Kami tidak menjual data input ini.
* **Bebas Cookie Pihak Ketiga:** Kami tidak menjual cookie atau memonetisasi profil kesehatan dan keuangan pribadi Anda ke jaringan periklanan.

## 2. Security / Keamanan Data
### English
We employ industry-standard encryption (SSL/TLS) for data in transit and robust Row Level Security (RLS) policies within our Supabase database to ensure that only you can access your private records and preferences.
### Bahasa Indonesia
Kami menggunakan enkripsi standar industri (SSL/TLS) untuk data dalam perjalanan dan kebijakan Row Level Security (RLS) yang kuat di dalam database Supabase kami untuk memastikan hanya Anda yang dapat mengakses catatan pribadi dan preferensi Anda.

## 3. Your Rights / Hak Anda
### English
You have the right to request deletion of your account and all associated calculations, progress metrics, and profile data at any time. Contact support to initiate this process.
### Bahasa Indonesia
Anda berhak meminta penghapusan akun Anda beserta semua data perhitungan, metrik kemajuan, dan profil terkait kapan saja. Hubungi dukungan kami untuk memulai proses ini.'
),
(
  'knowledge', 
  'Knowledge Base & Panduan Pengguna', 
  '# Knowledge Base / Pusat Bantuan

Welcome to the LifeBloom Hub Knowledge Base. Find guides, system walkthroughs, and answers to common questions about our platform.

Selamat datang di Pusat Bantuan LifeBloom Hub. Temukan panduan, dokumentasi sistem, dan jawaban atas pertanyaan umum tentang platform kami.

---

## Getting Started / Memulai Penggunaan

### 1. How does the translation engine work?
LifeBloom Hub integrates a multi-tier hybrid translation system:
* **Tier 1 (Groq API):** Performs ultra-fast, contextual HTML block translations.
* **Tier 2 (Gemini Flash):** Acts as a resilient fallback for structured JSON array translation.
* **Tier 3 (Lingva Proxy Pool):** Provides fallback translation for individual blocks.
All translations are cached in Upstash Redis and persisted in Supabase to minimize latency and external API costs.

### Bagaimana cara kerja mesin penerjemah kami?
LifeBloom Hub mengintegrasikan sistem terjemahan hibrida multi-tier:
* **Tier 1 (Groq API):** Menerjemahkan blok HTML secara kontekstual dengan sangat cepat.
* **Tier 2 (Gemini Flash):** Berfungsi sebagai cadangan untuk menerjemahkan array JSON terstruktur.
* **Tier 3 (Lingva Proxy Pool):** Menyediakan terjemahan cadangan untuk setiap blok secara individu.

---

### 2. What are Bloom Points?
Bloom Points are part of our gamification system. Users earn points by:
* Completing interactive tool assessments (e.g., Budget Renovator).
* Reading curated advisory articles.
* Participating in community discussions.

### Apa itu Bloom Points?
Bloom Points adalah bagian dari sistem gamifikasi kami. Pengguna mendapatkan poin dengan:
* Menyelesaikan penilaian alat interaktif (misalnya, Budget Renovator).
* Membaca artikel saran yang dikurasi.
* Berpartisipasi dalam diskusi komunitas.

---

### 3. How do B2B Partnerships work?
Brands and sponsors can place contextual, non-intrusive native widgets inside calculations and support pages to present highly relevant solutions to senior households. See [Join Us](/join-us) for details.'
)
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content;
