import { getPublishedScenarios } from "@/lib/content-api";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const difficultyLabels = { easy: "kolay", normal: "orta", hard: "zor" };

// llms.txt: a plain-language summary that AI assistants can read when people ask about detective games.
export async function GET() {
  const scenarios = await getPublishedScenarios({ sort: "-popularity_score,title" }).catch(() => []);

  const caseLines = scenarios.map(
    (scenario) =>
      `- [${scenario.title}](${absoluteUrl(`/cases/${scenario.slug}`)}): ${scenario.teaser || scenario.description || ""} (${
        difficultyLabels[scenario.difficulty] || "orta"
      }, ~${scenario.estimated_duration || 20} dk${scenario.category?.title ? `, ${scenario.category.title}` : ""})`
  );

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME}, tarayıcıda oynanan Türkçe bir dedektif oyunudur. Oyuncu bir vaka dosyası seçer, olayın hikâyesini okur ya da komiserin sesli brifingini dinler; belgeler, fotoğraflar, kamera kareleri ve ses kayıtlarından oluşan delilleri inceler; şüphelileri yapay zekâ ile canlı olarak sorgular ve sonunda suçluyu gerekçesiyle suçlar. Ücretsizdir, indirme gerektirmez, mobilde de çalışır.

## Öne çıkanlar

- Şüpheliler yapay zekâyla, karakterlerine uygun ve Türkçe cevap verir; suçlu yalan söyler, masumlar ipucu verir.
- Oyuncu sorgu sırasında bir delili şüphelinin önüne koyup tepkisini görebilir.
- Her vakada 6-9 delil vardır: belgeler, sistem dökümleri, grafikler, kamera kareleri, telefon ve telsiz kayıtları.
- Puan, yıldız (ipucusuz çözüm 3 yıldız) ve rütbe sistemi (Çaylak'tan Komiser'e).
- Noir atmosfer: yağmur ve caz müziği, ses efektleri.
- Kayıt e-posta ya da Google hesabıyla yapılır.

## Bağlantılar

- [Ana sayfa](${absoluteUrl("/")})
- [Online dedektif oyunu nedir, nasıl oynanır](${absoluteUrl("/dedektif-oyunu")})
- [Tüm vakalar](${absoluteUrl("/cases")})
- [Oyunu oyna](${absoluteUrl("/play")})
- [Gizlilik politikası](${absoluteUrl("/gizlilik")})

## Vakalar

${caseLines.join("\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
