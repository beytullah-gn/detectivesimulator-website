export default function AuthPanel({
  title,
  submitLabel,
  footerLabel,
  onSubmit,
  onFooterClick,
  loading,
  showConfirmPassword,
}) {
  return (
    <section className="panel auth">
      <h2>{title}</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input type="email" name="email" required placeholder="ornek@mail.com" />
        </label>
        <label>
          Şifre
          <input type="password" name="password" required placeholder="••••••••" />
        </label>
        {showConfirmPassword ? (
          <label>
            Şifre Tekrar
            <input
              type="password"
              name="passwordConfirm"
              required
              placeholder="••••••••"
            />
          </label>
        ) : null}
        <button type="submit" disabled={loading}>
          {loading ? "İşlem sürüyor..." : submitLabel}
        </button>
        <button type="button" className="ghost" onClick={onFooterClick}>
          {footerLabel}
        </button>
      </form>
    </section>
  );
}
