# Detective Simulator - Website

Detective Simulator oyununun React tabanli frontend uygulamasi.

Bu uygulama:

- Senaryo listesi ve detay ekranlarini gosterir
- Oyuncu sorgulama ve ipucu akisini yonetir
- Directus backend API ile iletisim kurar

## Tech Stack

- React 19
- Vite 7
- ESLint 9

## Project Structure

- src/components: UI bilesenleri
- src/pages: Sayfa seviyesi bilesenler
- src/services: API ve auth servisleri
- src/constants: Ortak sabitler
- src/utils: Yardimci fonksiyonlar

## Prerequisites

- Node.js 22.x (onerilen)
- npm

## Environment Setup

1. Ornek dosyayi kopyalayin:

   cp .env.example .env

2. Backend URL degerini ayarlayin:

- VITE_API_BASE_URL=http://localhost:8056

Not:

- URL sonunda slash olmamasi onerilir.
- .env dosyasi versiyon kontrolune dahil edilmez.

## Development

Bagimliliklari yukleyin:

    npm install

Gelistirme sunucusunu baslatin:

    npm run dev

Varsayilan adres:

- http://localhost:5173

## Build and Preview

Production build:

    npm run build

Build onizleme:

    npm run preview

## Lint

Kod kalitesi kontrolu:

    npm run lint

## API Configuration

API temel adresi su sekilde cozulur:

1. VITE_API_BASE_URL tanimliysa bu kullanilir
2. Development modda fallback: http://localhost:8056
3. Production modda fallback: https://panel.detectivesimulator.com

## Related Repository

Ana backend ayri repoda bulunur:

- detectivesimulator-directus
