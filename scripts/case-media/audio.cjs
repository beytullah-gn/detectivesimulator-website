// Spoken evidence, hints and briefings. Speakers map to voice settings in render-audio.cjs.
// Times and numbers are written out so the Turkish voice reads them naturally.
const briefing = (text) => ({ fx: "briefing", lines: [["komiser", text]] });
const hint = (text) => ({ fx: "voicemail", lines: [["komiser", `Dedektif, ben Komiser Aydın. ${text} Kolay gelsin.`]] });

module.exports = {
  // Ambar 17
  "ambar-17-sapmasi/brifing.mp3": briefing(
    "Dedektif, dosya masanda. Dün gece limanda on dört palet kanser ilacı, bir soğutma alarmı bahanesiyle boş duran Ambar on yediye taşındı. Sabah iki palet eksik çıktı. Alarm, rota kararı ve sonradan girilen bir dispatch notu birbirini tutmuyor. Dört kişiyle konuşacaksın. Biri yalan söylüyor. Bul onu."
  ),
  "ambar-17-sapmasi/telsiz-2236.mp3": {
    fx: "radio",
    lines: [
      ["male", "Aylin, soğutmada alarm var. Paletleri Ambar on yediye çek, yazılısı sonra gelir."],
      ["female", "Yazılı onay olmadan mı?"],
      ["male", "Sorumluluk bende. Hadi, vakit kaybetmeyelim."],
    ],
  },
  "ambar-17-sapmasi/telesekreter-ferit.mp3": {
    fx: "voicemail",
    lines: [["male2", "Dispatch, ben Ferit, Yıldız Lojistik. Ambar on yedideki iki palet yüklendi, araç çıktı. Burak Bey'e iletin, gerisini yarın konuşuruz."]],
  },
  "ambar-17-sapmasi/ipucu-ses.mp3": hint(
    "Dispatch düzeltme notu, rota değişikliğinden kırk dakika sonra girilmiş. Karar önce verilmiş, gerekçe sonradan yazılmış. Bunu kim yapar, bir düşün."
  ),

  // Galata
  "galata-patent-dosyasi/brifing.mp3": briefing(
    "Dedektif, Galata'daki bir girişimin iki yıllık emeği bir öğleden sonra kayboldu. İmzalı patent dosyası, kurucu yatırımcılarla toplantıdayken arşivden çıkmış. Kapı kayıtlarında yedi dakikalık bir boşluk var ve rakip firma pazartesi aynı cümlelerle başvuru yaptı. Dosyayı kimin aldığını ve kime sattığını bul."
  ),
  "galata-patent-dosyasi/sesli-mesaj-1441.mp3": {
    fx: "voicemail",
    lines: [["male", "Derya Hanım, ben Bora. Sistemde bir dış saldırı izi görüyorum, arşivdeki patent dosyası tehlikede olabilir. Kayıtları bir kontrol edin, olur mu?"]],
  },
  "galata-patent-dosyasi/ipucu-ses.mp3": hint(
    "Saat on dördü kırk bir geçe bırakılan sesli mesaj, dosyanın kaybolduğu fark edilmeden önce bırakılmış. Henüz kimsenin bilmediği bir şeyi kim bilebilir?"
  ),

  // Pera
  "pera-galeri-gecesi/brifing.mp3": briefing(
    "Dedektif, Pera'da bir galerinin açılış gecesinde, kasadaki en değerli çizim kusursuz bir kopyayla değiştirildi. Kasa kapısı zorlanmamış. Bir nem alarmı çalmış, yirmi üç saniye sonra susmuş, kalabalık başka bir salona yönlendirilmiş. Değişimin hangi dakikalarda ve kimin eliyle yapıldığını bul."
  ),
  "pera-galeri-gecesi/telsiz-2012.mp3": {
    fx: "radio",
    lines: [["male", "Tüm ekiplere. Kasa odasında nem alarmı. Misafirleri Ana Salon B'ye alın, kasa koridorunu boşaltın. Kasa odasına ben bakıyorum."]],
  },
  "pera-galeri-gecesi/telesekreter-1702.mp3": {
    fx: "voicemail",
    lines: [["male2", "Kerem Bey. Kasadaki açığı herkesten önce ben öğrendim. Bu akşam, konuştuğumuz gibi. Yoksa Aslı Hanım her şeyi öğrenir."]],
  },
  "pera-galeri-gecesi/ipucu-ses.mp3": hint(
    "Replika bir gecede hazırlanmaz. Öğleden sonra galeriye giren kutuya ve teslim fişindeki boş imza alanına bak."
  ),

  // Karaköy
  "karakoy-konteyner-dosyasi/brifing.mp3": briefing(
    "Dedektif, Karaköy'deki gümrüklü depoda bir konteynerden sekiz kasa tıbbi sensör kayboldu. İşin garibi, sistemdeki manifesto da artık eksik sayıyı gösteriyor. Kâğıt üzerinde her şey temiz. Herkes gece vardiyasındaki depo sorumlusuna bakıyor. Sen bakma. Kaybın kâğıtta mı, sahada mı başladığını bul."
  ),
  "karakoy-konteyner-dosyasi/telefon-2350.mp3": {
    fx: "phone",
    lines: [
      ["female", "Yusuf Bey, muayene sabaha kaldı. Siz vardiyayı devredin, evrakı ben hallederim."],
      ["male2", "Seal numarası tutmuyor ama."],
      ["female", "Doğrusunu ben okuyayım, siz düzeltin. Yedi yedi üç bir dokuz dört sıfır."],
    ],
  },
  "karakoy-konteyner-dosyasi/ipucu-ses.mp3": hint(
    "Muayeneyi erteleyen, Yusuf'u sahadan uzaklaştıran ve gece manifestoyu değiştiren kişi aynı mı? Kayıtlara bu gözle bak."
  ),

  // Maslak
  "maslak-veri-sizintisi/brifing.mp3": briefing(
    "Dedektif, Maslak'taki bir analitik şirketinin en değerli dosyası, satın alma görüşmelerinden iki gün önce rakibin sahnesinde göründü. Herkes sunucu bakımı gecesindeki gürültüye bakıyor. Ama dosya o kapıdan çıkmamış olabilir. Kimin, hangi hesapla ve neden sızdırdığını bul."
  ),
  "maslak-veri-sizintisi/emre-sesli-not.mp3": {
    fx: "recorder",
    lines: [["male", "Not. Admin panelinde export yok. Bütün hatalı girişler benim betiklerim. Dosya veri aracından çıkmış, ikiyi on dört yedi geçe. Hesap, okan nokta vural. Bunu Rana Hanım'a göstermem lazım."]],
  },
  "maslak-veri-sizintisi/ipucu-ses.mp3": hint(
    "Sızıntının saatini henüz kimse bilmiyorken salı gecesini işaret eden biri var. Kanal mesajlarını bir daha oku."
  ),

  // Nişantaşı
  "nisantasi-heykel-degisimi/brifing.mp3": briefing(
    "Dedektif, Nişantaşı'ndaki bir konakta sponsor brunch'ı sırasında bronz bir heykel, haftalar önce hazırlanmış bir kopyayla değiştirildi. Kimse eseri taşırken görülmedi. Servis koridorunda üç dakikalık bir boşluk var ve birileri sabah sigorta bedelini fazlasıyla merak etmiş. Planı ve planlayanı bul."
  ),
  "nisantasi-heykel-degisimi/telsiz-1241.mp3": {
    fx: "radio",
    lines: [
      ["male", "Servis koridorunda araba sıkıştı, iki dakika kimse geçmesin."],
      ["male2", "Ben arkadan geçiyorum Tarık, sponsorları salona alıyorum."],
      ["male", "Levent Bey, orası program dışı!"],
    ],
  },
  "nisantasi-heykel-degisimi/mina-sesli-not.mp3": {
    fx: "recorder",
    lines: [["female2", "Saat on beş otuz iki. Patina taze, kokusu hâlâ üstünde. İmza sığ, döküm sonrası kazınmış. Bu bir replika. Hem de aceleyle değil, haftalar önce hazırlanmış."]],
  },
  "nisantasi-heykel-degisimi/ipucu-ses.mp3": hint(
    "Ana salona değil, servis koridoruna bak. Koridor kapatılırken oradan kim geçti?"
  ),
};
