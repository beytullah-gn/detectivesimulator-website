# Detective Simulator Frontend

Next.js tabanlı Detective Simulator istemcisi.

## Stack

- Next.js 16
- React 19
- Directus Content API

## Environment

`.env.local` dosyasına aşağıdaki değişkenleri ekleyin:

```bash
CONTENT_INTERNAL_URL=http://127.0.0.1:8057
NEXT_PUBLIC_CONTENT_BASE_URL=http://localhost:8057
NEXT_PUBLIC_API_BASE_URL=http://localhost:8057
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Local Run

Directus `8057`, Next.js `3000` portunda çalışır.

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Build And Test

Release öncesi kabul akışı:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` şu akışı doğrular:

- `/`, `/cases`, vaka detay ve `/play` rotaları
- kayıt, giriş, senaryo seçimi ve session başlatma
- şüpheli sorgulama, ipucu alma ve final karar değerlendirmesi
- mobile/desktop yatay overflow kontrolü
- screenshot ve JSON rapor: `test-results/detective-playwright/`

Tam release kontrolü için:

```bash
npm run test:release
```

## AI Free Model Policy

AI cevapları Directus backend üzerinden OpenRouter ile üretilir. Backend tarafındaki koruma `OPENROUTER_MODEL` değerinin yalnızca `openrouter/free` veya `:free` ile biten modeller olmasına izin verir. Varsayılan model `openai/gpt-oss-120b:free` olmalıdır; ücretli modele düşme yapılmaz.

## Notes

- Oyun state ve API aksiyonları `src/hooks/useDetectiveGame.js` içinde toplanmıştır.
- UI akışı Directus içerik modeli ile uyumludur.
- Görsel bileşenlerde mevcut deneyimi bozmamak için native `img` kullanımı korunmuştur.
