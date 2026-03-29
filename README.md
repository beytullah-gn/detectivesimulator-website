# Detective Simulator Frontend

Next.js tabanli detective simulator istemcisi.

## Stack

- Next.js 16
- React 19
- Directus REST API

## Environment

`.env.local` dosyasina asagidaki degiskeni ekleyin:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8057
```

## Development

```bash
npm install
npm run dev
```

Uygulama varsayilan olarak `http://localhost:3000` adresinde calisir.

## Notes

- Oyun state ve API aksiyonlari `src/hooks/useDetectiveGame.js` icinde toplanmistir.
- UI akisi mevcut tasarimi korur; veri sozlesmesi Directus v2 schema ile uyumludur.
- Gorsel bileşenlerde mevcut deneyimi bozmamak icin native `img` kullanimi korunmustur.
