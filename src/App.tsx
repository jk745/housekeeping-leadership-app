import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/router";
import { AppStateProvider } from "./state/app-state";

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppStateProvider>
  );
}
