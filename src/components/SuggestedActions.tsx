import type { EntryTypeId } from "../lib/types";

const suggestedActionsByType: Record<EntryTypeId, string[]> = {
  "reading-note": [
    "先挑一個可以在下次跟房或查房時實際提醒自己的小動作。",
    "把書中觀念對回房務現場語言，避免只停在抽象領導概念。",
    "先理解，再帶領；先信任，再要求；先穩定，再改善。",
  ],
  "field-observation": [
    "下次觀察時補記房況回報節點，確認卡點是在查房前、查房後或跨部門交接。",
    "先記現象與影響，不急著把現場壓力直接定義成某個人的問題。",
    "若涉及急房、延退或維修通報，先釐清誰在等待誰的資訊。",
  ],
  "team-interaction": [
    "下次互動先追問對方最在意的節點，尤其是急房、查房或備品補充壓力。",
    "先補上你能支援的動作，再談你希望團隊配合的期待。",
    "把資深同仁的現場語言記下來，之後帶人時更容易對頻。",
  ],
  "improvement-idea": [
    "先確認這個議題是偶發還是尖峰時段重複出現，再決定要不要升級追蹤。",
    "先試一個小步驟，例如明確回報節點或查房前後的交接句型。",
    "把影響對象寫清楚，方便後續和客務、房務一起對齊優先順序。",
  ],
  "manager-update": [
    "回報時先講本週觀察與初步判斷，再補主管需要協助的部分。",
    "若提到風險，盡量連結入住尖峰、房況穩定度或跨部門銜接影響。",
    "保留現場語氣，讓主管容易理解不是抽象感受，而是具體房務節點。",
  ],
  "weekly-review": [
    "下週先守住一個還不穩的房務語言或現場判斷，不要同時追太多改善。",
    "把這週更穩的地方講清楚，建立你對房務節奏的自信基礎。",
    "若有反覆出現的卡點，可在下次主管回報時帶進去一起討論。",
  ],
};

type SuggestedActionsProps = {
  entryType: EntryTypeId;
  actions?: string[];
};

export function SuggestedActions({ entryType, actions }: SuggestedActionsProps) {
  const displayActions =
    actions && actions.length > 0 ? actions : suggestedActionsByType[entryType];

  return (
    <section className="entry-card section-stack">
      <div className="section-header">
        <h2>目前可先採取的下一步</h2>
        <p>先把下一步縮小到現場可執行的動作，避免一下子想做太多改善。</p>
      </div>

      <ul className="suggestion-list">
        {displayActions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </section>
  );
}
