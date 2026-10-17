// Evidence and hint images, keyed by output path under public/case-media.
const komiserNote = (lines) => ({ template: "note", data: { lines: [...lines, "— K. Aydın"], style: "sticky" } });

module.exports = {
  // Ambar 17 ---------------------------------------------------------------
  "ambar-17-sapmasi/dispatch-dokumu.jpg": {
    template: "printout",
    data: {
      title: "DISPATCH SİSTEMİ — İŞLEM DÖKÜMÜ",
      subtitle: "Haydarpaşa Liman Sahası · Gece Vardiyası · 14 Ekim",
      columns: ["SAAT", "KULLANICI", "İŞLEM", "HEDEF", "ONAY"],
      rows: [
        ["22.04", "A.KARA", "Vardiya açılışı", "—", "OTOMATİK"],
        ["22.12", "C.OZTURK", "Muayene sırası", "Bonded Depo", "GÜMRÜK"],
        ["22.31", "SİSTEM", "Soğutma uyarısı (SNS-07)", "Konteyner 3", "—"],
        ["22.38", "B.SEFER", "Rota değişikliği 14 palet", "Ambar 17", "—"],
        ["22.39", "B.SEFER", "Yan giriş yetki talebi", "Ambar 17 / YG", "—"],
        ["23.05", "A.KARA", "Vardiya devri", "—", "OTOMATİK"],
        ["23.17", "B.SEFER", "Not: soğutma riski, geçici rota", "Ambar 17", "—"],
      ],
      highlight: [3, 6],
      footer: "Onay alanı boş kayıtlar: 3 · Döküm alan: Gümrük Müdürlüğü inceleme birimi",
    },
  },
  "ambar-17-sapmasi/sogutma-grafigi.jpg": {
    template: "chart",
    data: {
      title: "SNS-07 · Konteyner 3 İç Sıcaklık",
      subtitle: "Soğuk zincir izleme paneli · 22.00 - 23.00",
      unit: "°C",
      points: [4.1, 4.0, 4.1, 4.1, 4.2, 4.1, 4.1, 4.0, 4.1, 4.1, 4.1, 4.1, 4.1, 4.0, 4.1, 4.1, 4.1, 4.2, 4.1, 4.1],
      yMin: 2,
      yMax: 9,
      alarmLine: 8,
      markIndex: 10,
      markLabel: "22.31 MANUEL RESET · veri boşluğu 40 sn",
      xLabels: ["22.00", "22.15", "22.30", "22.45", "23.00"],
    },
  },
  "ambar-17-sapmasi/kamera-yan-giris.jpg": {
    template: "cctv",
    data: {
      camera: "CAM-11 AMBAR17 YAN GİRİŞ",
      timestamp: "14.10 22:39:07",
      caption: "TURNİKE AÇILDI · YETKİ: DISPATCH SUPERVISOR · KART: 4471",
      scene: `<defs>
          <radialGradient id="lamp" cx="0.62" cy="0.1" r="0.6"><stop offset="0" stop-color="#d8d8cf" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
          <filter id="blur"><feGaussianBlur stdDeviation="3 1"/></filter>
        </defs>
        <polygon points="0,600 0,330 960,250 960,600" fill="#2f312c"/>
        <polygon points="0,330 960,250 960,0 0,0" fill="#1b1c19"/>
        <g stroke="#4a4c46" stroke-width="2"><line x1="80" y1="600" x2="430" y2="300"/><line x1="380" y1="600" x2="560" y2="292"/><line x1="760" y1="600" x2="700" y2="282"/></g>
        <rect x="560" y="70" width="330" height="215" fill="#121310" stroke="#6a6d66" stroke-width="5"/>
        <rect x="575" y="150" width="300" height="135" fill="#050505"/>
        <g stroke="#3d3f3a" stroke-width="3">${Array.from({ length: 7 }, (_, i) => `<line x1="575" x2="875" y1="${88 + i * 9}" y2="${88 + i * 9}"/>`).join("")}</g>
        <text x="600" y="132" fill="#c9cbc3" font-size="24" font-family="Menlo" letter-spacing="3">AMBAR 17</text>
        <rect x="0" y="0" width="960" height="600" fill="url(#lamp)"/>
        <g fill="#8d9089"><rect x="410" y="300" width="16" height="150"/><rect x="520" y="300" width="16" height="150"/><rect x="426" y="350" width="94" height="8"/><rect x="426" y="380" width="94" height="8"/></g>
        <g filter="url(#blur)" fill="#0b0b0a" opacity=".92"><ellipse cx="470" cy="262" rx="20" ry="24"/><path d="M438 292 Q470 276 502 292 L512 400 L430 400 Z"/><rect x="440" y="398" width="18" height="70"/><rect x="482" y="398" width="18" height="70"/></g>
        <g fill="#6b6e66"><rect x="90" y="420" width="190" height="26"/><rect x="100" y="352" width="80" height="68"/><rect x="186" y="352" width="84" height="68"/><rect x="100" y="300" width="170" height="50"/></g>
        <text x="104" y="335" fill="#2a2b27" font-size="16" font-family="Menlo">+2/+8°C</text>`,
    },
  },
  "ambar-17-sapmasi/ipucu-not.jpg": komiserNote(["Alarm metnine değil", "grafiğe bak.", "Isı gerçekten", "yükseldi mi?"]),

  // Galata ---------------------------------------------------------------
  "galata-patent-dosyasi/kat-plani.jpg": {
    template: "floorplan",
    data: {
      title: "LUMEN BİYOSENSÖR · 3. KAT",
      rooms: [
        { x: 60, y: 90, w: 300, h: 220, label: "Toplantı Odası" },
        { x: 380, y: 90, w: 170, h: 220, label: "Bora (Finans)" },
        { x: 570, y: 90, w: 170, h: 220, label: "Elif (CEO)" },
        { x: 60, y: 400, w: 260, h: 200, label: "Laboratuvar" },
        { x: 340, y: 400, w: 190, h: 200, label: "ARŞİV", mark: true },
        { x: 550, y: 400, w: 190, h: 200, label: "Güvenlik Odası", mark: true },
        { x: 760, y: 90, w: 180, h: 510, label: "Lobi / Giriş" },
      ],
      extras: `<rect x="60" y="320" width="700" height="70" fill="none" stroke="#9fb6d4" stroke-dasharray="8 6"/>
        <text x="410" y="360" text-anchor="middle">KORİDOR</text>
        <circle cx="435" cy="395" r="7" fill="#f0c040"/><text x="452" y="384" font-size="12">kartlı kapı</text>`,
      legend: ["Toplantı odası camları buzlu", "Arşiv: yalnızca kartla giriş", "Bakım modu: güvenlik konsolu"],
    },
  },
  "galata-patent-dosyasi/erisim-dokumu.jpg": {
    template: "printout",
    data: {
      title: "KARTLI GEÇİŞ SİSTEMİ — OLAY KAYDI",
      subtitle: "Lumen Biyosensör · 3. Kat · Cuma",
      columns: ["SAAT", "KAPI", "KART", "OLAY"],
      rows: [
        ["13.58", "Toplantı Odası", "E.ARMAN", "Giriş"],
        ["14.02", "Laboratuvar", "Z.KAYA", "Giriş"],
        ["14.11", "Güvenlik Odası", "B.DEMIR", "Giriş"],
        ["14.12", "Arşiv", "KONSOL-01", "BAKIM MODU AÇILDI · kayıt durdu"],
        ["14.19", "Arşiv", "KONSOL-01", "Bakım modu kapandı"],
        ["14.24", "Toplantı Odası", "B.DEMIR", "Giriş"],
        ["15.30", "Arşiv", "Z.KAYA", "Giriş"],
      ],
      highlight: [2, 3, 4],
      footer: "Bakım modu yalnızca güvenlik odasındaki KONSOL-01'den başlatılabilir.",
    },
  },
  "galata-patent-dosyasi/kilit-ekrani.jpg": {
    template: "lockscreen",
    data: {
      time: "14:52",
      date: "Cuma, 11 Ekim",
      notifications: [
        { app: "KasaBet", when: "13.40", title: "Hesap bildirimi", body: "Hesabınız ödenmemiş bakiye nedeniyle askıya alındı.", color: "#1aa34a" },
        { app: "Mesajlar", when: "13.58", title: "K.", body: "Cuma'ya kadar 480. Uzatma yok.", color: "#34c759" },
        { app: "Mesajlar", when: "14.47", title: "+90 5•• ••• 31 07", body: "Sunum ne zaman bitiyor?", color: "#34c759" },
      ],
    },
  },
  "galata-patent-dosyasi/haciz-yazisi.jpg": {
    template: "document",
    data: {
      org: "T.C. İSTANBUL 14. İCRA DAİRESİ",
      date: "02.10",
      docTitle: "Maaş Haczi Müzekkeresi",
      ref: "Dosya No: 2026/48117 Esas",
      paragraphs: [
        "Borçlu Bora Demir'in kurumunuzdan almakta olduğu maaş ve her türlü ücretinin dörtte birinin, aşağıda yazılı borç tamamen ödeninceye kadar kesilerek dairemiz hesabına gönderilmesi rica olunur.",
      ],
      fields: [
        ["Borçlu", "Bora Demir"],
        ["Alacak", "612.000,00 TL"],
        ["Muhatap", "Lumen Biyosensör A.Ş. — Finans Birimi"],
      ],
      stamp: "İCRA",
      note: "Bora Bey'in masasında açılmamış zarfta bulundu",
    },
  },
  "galata-patent-dosyasi/nova-basvuru.jpg": {
    template: "document",
    data: {
      org: "NOVA MEDİKAL A.Ş. · PATENT BAŞVURUSU",
      date: "Pazartesi 09.12",
      docTitle: "Gözyaşı sıvısından glikoz ölçen kontakt lens",
      ref: "Başvuru özeti · İstemler 1-3",
      paragraphs: [
        "İstem 1: Gözyaşı film tabakasıyla temas eden ve glikoz konsantrasyonunu enzimatik olmayan bir sensör katmanıyla ölçen kontakt lens.",
        "İstem 2: Sensör katmanının hidrojel matrise gömülü grafen mikroelektrotlardan oluştuğu İstem 1'e göre lens.",
        "İstem 3: Ölçüm verisinin lens kenarındaki halka antenle pasif olarak aktarıldığı İstem 1 veya 2'ye göre lens.",
      ],
      note: "Lumen dosyasıyla kelimesi kelimesine aynı!",
      stamp: "KOPYA",
      stampColor: "#36557a",
    },
  },
  "galata-patent-dosyasi/ipucu-not.jpg": komiserNote(["Kayıt boşluğu 14.12'de", "başlıyor. Bakım modunu", "kim, nereden açabilir?"]),

  // Pera -------------------------------------------------------------------
  "pera-galeri-gecesi/kat-plani.jpg": {
    template: "floorplan",
    data: {
      title: "GALERİ MAVİ KAPI · ZEMİN KAT",
      rooms: [
        { x: 60, y: 90, w: 360, h: 260, label: "Ana Salon A" },
        { x: 60, y: 370, w: 360, h: 230, label: "Lobi" },
        { x: 600, y: 90, w: 340, h: 260, label: "Ana Salon B" },
        { x: 440, y: 90, w: 140, h: 120, label: "Kasa Odası", mark: true },
        { x: 600, y: 370, w: 340, h: 230, label: "Teknik / Ofis" },
      ],
      extras: `<rect x="440" y="220" width="140" height="380" fill="none" stroke="#9fb6d4" stroke-dasharray="8 6"/>
        <text x="510" y="420" text-anchor="middle" transform="rotate(-90 510 420)">KASA KORİDORU</text>
        <path d="M330 300 C 500 250, 650 260, 760 230" stroke="#f0c040" stroke-width="3" fill="none" stroke-dasharray="10 8" marker-end="url(#a)"/>
        <defs><marker id="a" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f0c040"/></marker></defs>
        <text x="560" y="290" fill="#f0c040" font-size="13">20.12 anons sonrası kalabalık</text>`,
      legend: ["Kasa koridoruna giriş: Salon A arkası", "Nem alarmında prosedür: tahliye lobiye", "Kasa paneli: teknik ofis + kasa odası"],
    },
  },
  "pera-galeri-gecesi/nem-paneli.jpg": {
    template: "chart",
    data: {
      title: "KASA ODASI · Bağıl Nem",
      subtitle: "Klima paneli kaydı · 19.50 - 20.30 · alarm 20.11.00 · reset 20.11.23 (K.SONMEZ)",
      unit: "%",
      points: [48, 48, 48.1, 48, 47.9, 48, 48, 48, 48, 48.1, 48, 48, 48, 48.1, 48, 48, 47.9, 48, 48, 48],
      yMin: 40,
      yMax: 65,
      alarmLine: 60,
      markIndex: 10,
      markLabel: "20.11 ALARM → 23 sn sonra yönetici anahtarıyla RESET",
      xLabels: ["19.50", "20.00", "20.10", "20.20", "20.30"],
    },
  },
  "pera-galeri-gecesi/teslim-fisi.jpg": {
    template: "document",
    data: {
      org: "GALERİ MAVİ KAPI · LOJİSTİK",
      date: "18.20",
      docTitle: "Kasa Odası Paket Teslim Fişi",
      ref: "Fiş No: MK-0917 · Sigorta Ek Protokolü Madde 4: iki imza zorunludur",
      fields: [
        ["İçerik", "Çerçeve malzemesi (teknik ekip adına)"],
        ["Ölçü", "62 × 48 × 9 cm"],
        ["Gönderen", "Belirtilmemiş kurye"],
        ["Teslim yeri", "Kasa odası ön alanı"],
      ],
      signatures: [
        { label: "Operasyon Müdürü", signed: "K. Sönmez" },
        { label: "Restorasyon Uzmanı", signed: "" },
      ],
      note: "Çizimin çerçevesi: 62 × 48 cm",
    },
  },
  "pera-galeri-gecesi/ipucu-not.jpg": komiserNote(["Nem hiç değişmedi.", "Alarmı 23 saniyede", "kim, hangi anahtarla", "susturdu?"]),

  // Karaköy ---------------------------------------------------------------
  "karakoy-konteyner-dosyasi/manifesto.jpg": {
    template: "document",
    data: {
      org: "GÜMRÜK BEYAN SİSTEMİ · KARAKÖY",
      date: "MSKU 482190-3",
      docTitle: "Manifesto Versiyon Karşılaştırması",
      ref: "Konşimento: RTM-IST 77120 · Alıcı: Medisens Tıbbi Cihaz",
      table: {
        columns: ["Alan", "v1 (22.05)", "v2 (00.47)"],
        rows: [
          ["Yükleyen", "S.ALKAN (ofis)", "S.ALKAN (uzaktan)"],
          ["Kasa adedi", "40", "32"],
          ["Brüt ağırlık", "6.480 kg", "5.184 kg"],
          ["Seal no", "7731904", "7731940"],
          ["Muayene", "06.00", "10.00"],
        ],
        highlight: [1, 2, 3],
      },
      stamp: "İNCELEMEDE",
    },
  },
  "karakoy-konteyner-dosyasi/uzaktan-giris.jpg": {
    template: "printout",
    data: {
      title: "GÜMRÜK PANELİ — OTURUM KAYDI",
      subtitle: "Kullanıcı: S.ALKAN · Gümrük Müşavirliği",
      columns: ["SAAT", "IP ADRESİ", "KONUM", "İŞLEM"],
      rows: [
        ["21.40", "85.105.12.40", "Müşavirlik ofisi", "Oturum açıldı"],
        ["22.05", "85.105.12.40", "Müşavirlik ofisi", "Manifesto v1 yüklendi"],
        ["23.58", "85.105.12.40", "Müşavirlik ofisi", "Muayene erteleme talebi"],
        ["00.47", "176.88.214.9", "Ev internet hattı (Üsküdar)", "Manifesto v2 yüklendi"],
        ["00.49", "176.88.214.9", "Ev internet hattı (Üsküdar)", "Oturum kapandı"],
      ],
      highlight: [2, 3],
      footer: "00.47 oturumunda başka işlem yok.",
    },
  },
  "karakoy-konteyner-dosyasi/erteleme-talebi.jpg": {
    template: "document",
    data: {
      org: "KARAKÖY GÜMRÜK MÜDÜRLÜĞÜ · MUAYENE",
      date: "23.58",
      docTitle: "Muayene Saati Değişiklik Talebi",
      ref: "Konteyner: MSKU 482190-3",
      fields: [
        ["Mevcut saat", "06.00"],
        ["Talep edilen", "10.00"],
        ["Gerekçe", "Eksik evrak tamamlanacak"],
        ["Talep eden", "Seda Alkan (Gümrük Müşaviri Temsilcisi)"],
      ],
      signatures: [
        { label: "Talep eden", signed: "S. Alkan" },
        { label: "Liman Operasyon Şefi onayı", signed: "" },
      ],
      stamp: "OTOMATİK ONAY",
      stampColor: "#36557a",
    },
  },
  "karakoy-konteyner-dosyasi/kapi-kaydi.jpg": {
    template: "printout",
    data: {
      title: "LİMAN KAPISI — ARAÇ GİRİŞ/ÇIKIŞ",
      subtitle: "Karaköy Gümrüklü Saha · Kapı 2",
      columns: ["SAAT", "PLAKA", "YÖN", "BEYAN", "İŞ EMRİ"],
      rows: [
        ["23.40", "34 TR 5521", "Çıkış", "Vardiya servisi", "SRV-12"],
        ["00.55", "34 KN 2217", "Giriş", "Boş dönüş alımı", "—"],
        ["00.58", "—", "—", "Rıhtım kamerası kapandı (vinç arızası)", "—"],
        ["01.22", "34 KN 2217", "Çıkış", "Boş dönüş", "—"],
        ["01.40", "—", "—", "Rıhtım kamerası açıldı", "—"],
      ],
      highlight: [1, 3],
      footer: "34 KN 2217 için o gece kayıtlı iş emri bulunmuyor.",
    },
  },
  "karakoy-konteyner-dosyasi/masa-notu.jpg": {
    template: "note",
    data: { style: "page", lines: ["H. yine aradı.", "Bu sevkiyattan sonra", "Arda'nın dosyası", "kapanacak dedi.", "", "34 KN — 01.00"] },
  },
  "karakoy-konteyner-dosyasi/ipucu-not.jpg": komiserNote(["Kayıp önce kâğıtta", "başlıyor. v2'yi kim,", "hangi hattan yükledi?"]),

  // Maslak -----------------------------------------------------------------
  "maslak-veri-sizintisi/export-kaydi.jpg": {
    template: "printout",
    data: {
      title: "VERİ PLATFORMU — DIŞA AKTARIM DENETİMİ",
      subtitle: "Veritas Analitik · Salı gecesi · bakım penceresi 02.00-03.00",
      columns: ["SAAT", "KAYNAK", "HESAP", "İŞLEM", "HEDEF"],
      rows: [
        ["02.03", "admin-panel", "e.polat", "Yetki yenileme (bakım)", "—"],
        ["02.09", "admin-panel", "e.polat", "Hatalı giriş ×12", "—"],
        ["02.14", "datatool", "okan.vural", "EXPORT cohort_segments_v7 48,2 MB", "sftp://185.193.•••"],
        ["02.21", "admin-panel", "e.polat", "Hatalı giriş ×9", "—"],
        ["02.48", "admin-panel", "e.polat", "Bakım tamamlandı", "—"],
      ],
      highlight: [2],
      footer: "Admin panelinden yapılmış dışa aktarım yok.",
    },
  },
  "maslak-veri-sizintisi/olay-kanali.jpg": {
    template: "chat",
    data: {
      workspace: "Veritas Analitik",
      channel: "# olay",
      messages: [
        { author: "Rana Çetin", time: "11.02", color: "#b5476b", text: "Pikselix sunumunda bizim segment modeli var. Herkes kanala." },
        { author: "Melis Tanyel", time: "11.09", color: "#4a7bd0", text: "Hukuk olarak bilgilendirildim. Kimse dışarıya yorum yapmasın." },
        { author: "Okan Vural", time: "11.24", color: "#3a9a6a", text: "Salı gecesi Emre'nin admin hesabında garip hareket var, oradan bakın." },
        { author: "Emre Polat", time: "11.31", color: "#c98a2b", text: "Hangi saatten bahsediyorsun? Daha kimse log açmadı." },
        { author: "Rana Çetin", time: "11.33", color: "#b5476b", text: "Emre, tüm export loglarını bana gönder. Hepsini." },
      ],
    },
  },
  "maslak-veri-sizintisi/pikselix-slayt.jpg": {
    template: "slide",
    data: {
      brand: "PİKSELİX · MÜŞTERİ ZEKÂSI",
      heading: "Müşterinizi 8 davranış grubunda tanıyın",
      items: [
        ["Sessiz Sadıklar", "Yüksek yaşam boyu değer, düşük etkileşim"],
        ["Kaçış Eşiği", "90 gün içinde ayrılma riski"],
        ["Fiyat Avcıları", "Yalnızca kampanyada alışveriş"],
        ["Gece Kuşları", "Etkileşimi 23.00 sonrası"],
        ["Yeni Meraklılar", "İlk 30 gün, yüksek keşif"],
        ["Sadakat Çekirdeği", "Tavsiye eden müşteriler"],
        ["Uyuyan Devler", "Kurumsal, düşük kullanım"],
        ["Sepet Terk Edenler", "Yüksek niyet, düşük dönüşüm"],
      ],
      footer: "Sektör Analitik Zirvesi · Perşembe 10.40",
    },
  },
  "maslak-veri-sizintisi/hesap-dokumu.jpg": {
    template: "document",
    data: {
      org: "BANKA HESAP ÖZETİ",
      date: "Son 6 ay",
      docTitle: "Okan Vural · Vadesiz TL Hesap",
      ref: "Mahkeme kararıyla alınan döküm (özet)",
      table: {
        columns: ["Tarih", "Açıklama", "Tutar"],
        rows: [
          ["12.05", "Danışmanlık ödemesi · Deltaweb", "+18.500 TL"],
          ["03.07", "Danışmanlık ödemesi · Aria Yazılım", "+9.200 TL"],
          ["21.08", "Kart borcu yapılandırma", "−287.000 TL"],
          ["30.09", "Gecikme faizi", "−14.380 TL"],
          ["Çarşamba", "SWIFT gelen · Larkspur Holdings Ltd.", "+150.000 TL"],
        ],
        highlight: [2, 4],
      },
      note: "Sızıntıdan bir gün sonra!",
    },
  },
  "maslak-veri-sizintisi/ipucu-not.jpg": komiserNote(["Gürültü admin", "panelinde. Dosya", "hangi kapıdan çıktı?"]),

  // Nişantaşı ---------------------------------------------------------------
  "nisantasi-heykel-degisimi/kat-plani.jpg": {
    template: "floorplan",
    data: {
      title: "KONAK SANAT EVİ · 1. KAT",
      rooms: [
        { x: 60, y: 90, w: 520, h: 330, label: "Ana Salon" },
        { x: 600, y: 90, w: 340, h: 200, label: "Mutfak / Catering" },
        { x: 600, y: 440, w: 160, h: 160, label: "Servis Asansörü", mark: true },
        { x: 60, y: 440, w: 520, h: 160, label: "Giriş Holü" },
        { x: 780, y: 440, w: 160, h: 160, label: "Arka Oda (Konservasyon)" },
      ],
      extras: `<rect x="600" y="300" width="340" height="120" fill="rgba(240,192,64,.12)" stroke="#9fb6d4" stroke-dasharray="8 6"/>
        <text x="770" y="365" text-anchor="middle">SERVİS KORİDORU</text>
        <rect x="500" y="250" width="40" height="40" fill="#f0c040"/><text x="470" y="240">heykel standı</text>
        <rect x="578" y="240" width="22" height="60" fill="#dfe9f5"/><text x="560" y="320" font-size="12">yan kapı</text>`,
      legend: ["Stand → yan kapı: 4 adım", "Koridor 12.41-12.44 gözetimsiz", "Asansör: bodrum otoparka iner"],
    },
  },
  "nisantasi-heykel-degisimi/taban-karsilastirma.jpg": {
    template: "document",
    data: {
      org: "KONSERVASYON TEKNİK RAPORU",
      date: "Pazar 15.40",
      docTitle: "\"Rüzgâra Karşı\" — Taban İmza Karşılaştırması",
      ref: "Hazırlayan: Mina Aksoy",
      table: {
        columns: ["Ölçüt", "Arşiv (orijinal)", "Standdaki eser"],
        rows: [
          ["İmza derinliği", "2,1 mm (dökümle)", "0,6 mm (sonradan kazınmış)"],
          ["Patina yaşı", "60 yıl, stabil", "En fazla 2 hafta, kokulu"],
          ["Ağırlık", "11,4 kg", "10,9 kg"],
          ["Döküm izi", "Kum döküm", "Kayıp mum döküm"],
        ],
        highlight: [0, 1],
      },
      stamp: "REPLİKA",
    },
  },
  "nisantasi-heykel-degisimi/sigorta-epostalari.jpg": {
    template: "email",
    data: {
      mails: [
        {
          subject: "Rüzgâra Karşı · ikame bedeli",
          date: "Pazar 09.02",
          from: "levent.ersoy@konaksanat.com",
          to: "eksper@anadoluguvence.com",
          body: "Merhaba, Rüzgâra Karşı için güncel ikame bedelini teyit eder misiniz? Bugün sponsor brunch'ında sergileniyor.",
        },
        {
          subject: "Re: Rüzgâra Karşı · ikame bedeli",
          date: "Pazar 10.47",
          from: "levent.ersoy@konaksanat.com",
          to: "eksper@anadoluguvence.com",
          body: "Bir sorum daha olacak: Eser hasar görür ya da değişirse ödeme kime yapılır? Konservasyon ekibinin taşıma hataları poliçeye dahil mi?",
        },
      ],
    },
  },
  "nisantasi-heykel-degisimi/dokum-faturasi.jpg": {
    template: "document",
    data: {
      org: "KAYA DÖKÜM ATÖLYESİ · TOPHANE",
      date: "3 Ekim",
      docTitle: "Fatura No: KD-2026-0418",
      ref: "Sayın: LE Danışmanlık Ltd. Şti.",
      table: {
        columns: ["Açıklama", "Adet", "Tutar"],
        rows: [
          ["1:1 bronz kopya, kayıp mum döküm, 42 cm", "1", "150.000 TL"],
          ["Patina uygulaması (eskitme, yeşil-kahve)", "1", "25.000 TL"],
          ["Taban imza işlemesi", "1", "10.000 TL"],
          ["TOPLAM", "", "185.000 TL"],
        ],
        highlight: [0, 2],
      },
      stamp: "ÖDENDİ",
      stampColor: "#2f6e4b",
      note: "LE Danışmanlık: tek ortak Levent Ersoy",
    },
  },
  "nisantasi-heykel-degisimi/ipucu-not.jpg": komiserNote(["İki haftalık patina", "= önceden sipariş.", "Fatura kime kesildi?"]),
};
