import { Route, Routes } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { EntryPage } from "../pages/EntryPage";
import { ReviewPage } from "../pages/ReviewPage";
import { SuccessPage } from "../pages/SuccessPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/entry/:entrySlug" element={<EntryPage />} />
      <Route path="/entry/:entrySlug/review" element={<ReviewPage />} />
      <Route path="/entry/:entrySlug/success" element={<SuccessPage />} />
    </Routes>
  );
}
