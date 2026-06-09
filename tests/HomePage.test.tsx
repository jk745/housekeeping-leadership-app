import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../src/app/router";
import { AppStateProvider } from "../src/state/app-state";

describe("HomePage", () => {
  it("renders the six home entries", () => {
    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </AppStateProvider>
    );

    expect(
      screen.getByRole("heading", { name: "房務部轉任領導系統" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("手機優先・網址即用")
    ).toBeInTheDocument();

    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(screen.getByRole("link", { name: "讀書筆記" })).toHaveAttribute(
      "href",
      "/entry/reading-note"
    );
    expect(screen.getByRole("link", { name: "現場觀察" })).toHaveAttribute(
      "href",
      "/entry/field-observation"
    );
    expect(screen.getByRole("link", { name: "團隊互動" })).toHaveAttribute(
      "href",
      "/entry/team-interaction"
    );
    expect(screen.getByRole("link", { name: "改善想法" })).toHaveAttribute(
      "href",
      "/entry/improvement-idea"
    );
    expect(screen.getByRole("link", { name: "主管回報" })).toHaveAttribute(
      "href",
      "/entry/manager-update"
    );
    expect(screen.getByRole("link", { name: "每週回顧" })).toHaveAttribute(
      "href",
      "/entry/weekly-review"
    );
  });

  it("navigates to the real entry page", async () => {
    const user = userEvent.setup();

    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </AppStateProvider>
    );

    await user.click(screen.getByRole("link", { name: "讀書筆記" }));

    expect(
      screen.getByRole("heading", { name: "讀書筆記" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "快速整理" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "回到首頁" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
