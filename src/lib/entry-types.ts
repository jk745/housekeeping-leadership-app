import type { EntryTypeConfig, EntryTypeId } from "./types";

const textarea = (name: string, label: string, placeholder: string) => ({
  name,
  label,
  placeholder,
  input: "textarea" as const,
});

const entryTypeConfigMap: Record<EntryTypeId, EntryTypeConfig> = {
  "reading-note": {
    id: "reading-note",
    label: "讀書筆記",
    description: "把領導觀念整理成房務部上任可執行的提醒與行動。",
    hint: "把領導讀書重點先整理成房務部可落地的做法。",
    quickFields: [
      textarea("todayReading", "今天讀到什麼", "例如：先理解，再帶領這段讓我停下來想很久"),
      textarea("triggeredThought", "這段讓我想到什麼", "例如：我不能一上任就急著改查房節奏"),
    ],
    detailedFields: [
      textarea("bookConcept", "書中觀念", "寫下今天最重要的一個領導觀念"),
      textarea("transferRelevance", "跟我轉任房務的關係", "這個觀念和退房清潔、查房或跨部門銜接有什麼關係"),
      textarea("leadershipReminder", "對我的提醒", "提醒自己上任時要注意什麼"),
      textarea("nextWeekAction", "我下週可以做的行動", "先寫一個可執行的小行動"),
    ],
  },
  "field-observation": {
    id: "field-observation",
    label: "現場觀察",
    description: "把退房清潔、查房、房況與銜接觀察整理成紀錄。",
    hint: "先記錄退房清潔、續住房整理與房況銜接的現場細節。",
    quickFields: [
      textarea("todaySeen", "今天看到什麼", "例如：急房回報一直卡在查房前後"),
      textarea("frictionPoint", "哪裡卡", "例如：房況回報節點不清楚，客務和房務都在等"),
      textarea("firstFeeling", "第一時間感受", "例如：不是速度問題，是節點沒有對齊"),
    ],
    detailedFields: [
      textarea("scene", "場景", "例如：房況回報／跨部門溝通／續住房整理"),
      textarea("processSeen", "我看到的流程", "描述退房清潔、查房、備品補充或交接實際怎麼運作"),
      textarea("unknowns", "我不懂的地方", "列出還要向資深同仁請教的點"),
      textarea("impactOnFrontDesk", "對客務的影響", "例如：櫃檯難以回覆入住時間或延退安排"),
      textarea("impactOnHousekeeping", "對房務的影響", "例如：同仁被反覆催房、布巾調度更緊"),
      textarea("improvementIdea", "可改善處", "先寫小改善，不急著大改流程"),
    ],
  },
  "team-interaction": {
    id: "team-interaction",
    label: "團隊互動",
    description: "整理你和房務主管、領班、資深同仁的互動與信任線索。",
    hint: "先整理你和房務主管、領班、資深同仁的互動脈絡。",
    quickFields: [
      textarea("whoSpokeWith", "今天跟誰講話", "例如：房務領班、小夜櫃檯、工程同仁"),
      textarea("whatTheyCareAbout", "對方最在意什麼", "例如：急房催促時不要跳過現場判斷"),
      textarea("whatIHeard", "我聽到什麼", "寫下對方直接說出口的重點"),
    ],
    detailedFields: [
      textarea("counterpart", "對象", "記下互動對象姓名或班別"),
      textarea("role", "角色", "例如：房務主管、資深房務員、客務主管"),
      textarea("likelyConcern", "對方可能在意", "對方現在最擔心或最重視的是什麼"),
      textarea("painPointHeard", "我聽到的困難", "例如：查房標準不一致、維修回報來回確認"),
      textarea("supportIcanOffer", "我可以支援的地方", "先寫支援，不先寫要求"),
      textarea("nextAction", "下一步行動", "下一次要追蹤、回覆或協調什麼"),
    ],
  },
  "improvement-idea": {
    id: "improvement-idea",
    label: "改善想法",
    description: "先收集卡點，再慢慢形成穩定、可追蹤的改善題目。",
    hint: "先收集卡點，再慢慢形成穩定、可追蹤的改善題目。",
    quickFields: [
      textarea("whatHappened", "發生什麼事", "例如：延退房與急房排序常常互相擠壓"),
      textarea("whatFeelsOff", "哪裡怪", "先寫直覺卡點，不急著下結論"),
      textarea("whoIsAffected", "影響到誰", "例如：房務同仁、櫃檯、晚到旅客"),
    ],
    detailedFields: [
      textarea("topic", "議題名稱", "幫這個改善題目先取一個清楚名稱"),
      textarea("category", "類型", "例如：房況銜接、備品補充、維修通報"),
      textarea("currentSituation", "目前狀況", "現在現場是怎麼運作的"),
      textarea("possibleCauses", "可能原因", "先列出推測，不急著認定唯一原因"),
      textarea("affectedPeople", "影響對象", "哪些同仁、部門或客人體驗被影響"),
      textarea("severity", "嚴重度", "寫下你判斷為何高、中、低"),
      textarea("frequency", "發生頻率", "例如：每天尖峰都會發生、偶爾發生"),
      textarea("initialIdea", "初步想法", "先寫能觀察或試行的小步驟"),
    ],
  },
  "manager-update": {
    id: "manager-update",
    label: "主管回報",
    description: "把觀察、進度與風險整理成主管容易掌握的內容。",
    hint: "把觀察、進度與風險整理成主管容易掌握的內容。",
    quickFields: [
      textarea("weeklyLearning", "本週學到什麼", "例如：查房節點比我原本理解得更影響房況節奏"),
      textarea("weeklyObservation", "本週看到什麼", "挑一到兩個最值得回報的觀察"),
      textarea("nextWeekFocus", "下週要做什麼", "寫出下週優先跟進的行動"),
    ],
    detailedFields: [
      textarea("learningFocus", "本週學習重點", "本週重新熟悉了哪些房務現場語言或流程"),
      textarea("fieldObservation", "本週現場觀察", "列出值得主管知道的現場情況"),
      textarea("crossTeamObservation", "客務與房務銜接觀察", "尤其是入住尖峰、急房、延退相關"),
      textarea("teamTrustStatus", "團隊信任與溝通狀況", "目前互動上有哪些進展或壓力"),
      textarea("initialJudgment", "初步判斷", "你的判斷是什麼，先求清楚不求完美"),
      textarea("nextWeekAction", "下週行動", "下週要持續觀察、請教或協調什麼"),
      textarea("supportNeeded", "需要主管協助事項", "若需要資源、授權或協調，清楚寫出來"),
    ],
  },
  "weekly-review": {
    id: "weekly-review",
    label: "每週回顧",
    description: "每週回看學到什麼、哪裡穩了、哪裡還要補。",
    hint: "每週回看你在哪些房務語言與管理判斷上更穩了。",
    quickFields: [
      textarea("weeklyGain", "這週最大的收穫", "例如：我開始聽得懂房況回報的節奏了"),
      textarea("stillUnsteady", "還不穩的地方", "例如：布巾調度與續住房優先順序判斷"),
      textarea("nextAdjustment", "下週想調整什麼", "先寫一個最重要的調整"),
    ],
    detailedFields: [
      textarea("weeklyProgress", "本週進展", "這週在哪些房務現場理解或帶人節奏上更穩"),
      textarea("keyObservation", "關鍵觀察", "本週最值得留下的房務或跨部門觀察"),
      textarea("trustProgress", "信任建立進度", "和團隊互動上有沒有更自然或更卡的地方"),
      textarea("challenge", "本週挑戰", "這週最卡的問題是什麼"),
      textarea("lessonLearned", "本週提醒", "對自己上任最重要的一句提醒"),
      textarea("nextWeekPriority", "下週優先事項", "下週最先要守住的觀察或行動"),
    ],
  },
};

export const entryTypeConfigs = entryTypeConfigMap;

export function getEntryTypeConfig(id: EntryTypeId): EntryTypeConfig {
  return entryTypeConfigMap[id];
}

export function getAllEntryTypeConfigs(): EntryTypeConfig[] {
  return Object.values(entryTypeConfigMap);
}

export function getEntryTypePath(id: EntryTypeId): string {
  return `/entry/${id}`;
}
