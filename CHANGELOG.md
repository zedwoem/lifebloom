# Changelog - LifeBloom Hub QA Hardening

Dokumen ini melacak seluruh aktivitas modifikasi, perbaikan keamanan, sinkronisasi tipe data, dan pengerasan operasional yang dilakukan pada platform LifeBloom Hub.

Format Catatan: `[TANGGAL] - [PHASE] - [ISSUE] - [RESOLUTION]`

---

## [2026-05-26]

- **[2026-05-26] - [PHASE 1: TYPE-SAFETY] - [Supabase Outdated Typings] - [RECONCILIATION]**
  - Memicu Supabase MCP Tool untuk menarik skema database aktif (`pusqytkxmoytvmajjodb`) dan meregenerasi `src/lib/supabase/types.ts` secara dinamis. Semua tabel seperti `api_health_logs`, `videos`, `aggregated_content`, `website_settings`, dan `support_documents` kini terdaftar dengan tipe data yang kaku (*strongly-typed*).
  
- **[2026-05-26] - [PHASE 1: TYPE-SAFETY] - [Supabase Query Any Casts] - [RESOLUTION]**
  - Membersihkan semua *type casting* `as any` dan `as any[]` dari pemanggilan Supabase:
    - Di `src/lib/services/rssService.ts` untuk bulk upsert `aggregated_content`.
    - Di `src/app/api/admin/health-ping/route.ts` untuk pencatatan logs `api_health_logs`.
    - Di `src/lib/actions/videoActions.ts` untuk pengisian data `videos` (sekaligus menyuplai properti wajib `video_id` dan `slug`).
    - Di `src/lib/actions/publishActions.ts` untuk kueri pembuatan dan ulasan `articles`.
    - Di `src/lib/actions/settingsActions.ts` untuk manajemen `website_settings` dan `support_documents`.
    - Di rute API `ai-shell`, `validate`, dan `preferences`.
  - Memvalidasi seluruh kompilasi kode Typescript sukses total bebas dari *error types*.

- **[2026-05-26] - [PHASE 2: E2E AUTOMATION] - [Regression of Security Exploits] - [RESOLUTION]**
  - Menginstal `@playwright/test` sebagai dependensi QA pengujian otomatis.
  - Mempersiapkan berkas pengujian end-to-end `tests/security.spec.ts` yang mensimulasikan serangan penetrasi *white-hat*:
    - **Open Redirect:** Memastikan `api/affiliate` secara kaku memblokir pengalihan domain tidak dikenal dan hanya menerima allowlist domain.
    - **Auth Bypass:** Menguji gerbang otorisasi `/admin` agar secara reaktif menendang pengguna tanpa role administrator.
    - **Health-Ping Abuse:** Menolak akses panggilan cron tanpa token terverifikasi.
    - **Calculations Points Exploit:** Menolak penyimpanan kalkulasi dan pemicu poin oleh pengguna anonim.

- **[2026-05-26] - [PHASE 3: MONITORING] - [Unhandled Promise Rejection Gaps] - [RESOLUTION]**
  - Memperkuat berkas konfigurasi Sentry (`sentry.client.config.ts`, `sentry.server.config.ts`) dengan mengaktifkan opsi `attachStacktrace: true` secara eksplisit guna melacak secara mendalam semua error asinkronus dan unhandled promises di runtime.

- **[2026-05-26] - [PHASE 4: FINAL HARDENING] - [Security Headers & Dead-Code Validation] - [RECONCILIATION]**
  - Melakukan audit silang terhadap konfigurasi Next.js (`next.config.ts`) untuk memastikan kebijakan keamanan global (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`) terpasang secara kaku.
  - Mengonfirmasi seluruh berkas *dead-code* dan draf skrip lama (`patch_admin.py`, `setup_routes.js`) telah dibersihkan sepenuhnya dari pohon repositori aktif.
