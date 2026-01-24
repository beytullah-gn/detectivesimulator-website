import { buildUrl } from "../services/apiClient";

export default function ScenarioMediaList({ media }) {
  if (!media.length) {
    return <p>Bu senaryo için ek dosya yok.</p>;
  }

  return (
    <ul className="media-list">
      {media.map((item) => (
        <li key={item.id}>
          <strong>{item.type || "Belge"}</strong>
          <span>{item.description || "Açıklama yok"}</span>
          {item.file ? (
            <a href={buildUrl(`/assets/${item.file}`)} target="_blank" rel="noreferrer">
              Dosyayı görüntüle
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
