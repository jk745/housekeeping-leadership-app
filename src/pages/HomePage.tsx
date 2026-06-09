import { Link } from "react-router-dom";
import { homeEntries } from "../features/home/entries";

export function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">手機優先・網址即用</p>
        <h1>房務部轉任領導系統</h1>
        <p className="hero-copy">
          先理解，再帶領；先信任，再要求；先穩定，再改善。這是一個讓你隨手打開網址，就能整理讀書筆記、
          現場觀察與管理思路的起點。
        </p>
      </section>

      <section aria-labelledby="home-entry-heading" className="section-stack">
        <div className="section-header">
          <h2 id="home-entry-heading">六個常用入口</h2>
          <p>從最常用的整理情境開始，先把現場語言重新熟悉起來。</p>
        </div>

        <div className="entry-grid">
          {homeEntries.map((entry) => (
            <Link
              key={entry.path}
              to={entry.path}
              className="entry-card"
              aria-label={entry.title}
            >
              <span className="entry-index">{entry.title}</span>
              <p>{entry.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
