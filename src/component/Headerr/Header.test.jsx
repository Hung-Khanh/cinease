import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

// Mock js-cookie
jest.mock("js-cookie", () => ({
    get: jest.fn(),
    set: jest.fn(),
}));

describe("Admin Header", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it("renders logo and navigation links", () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        expect(screen.getByAltText("logo")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Movies")).toBeInTheDocument();
    });

    it("shows Sign In link when not logged in", () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("shows avatar and dropdown when logged in as EMPLOYEE", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ username: "admin", role: "EMPLOYEE", image: "" })
        );
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
        expect(screen.getByRole("img", { name: /avatar/i })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("img", { name: /avatar/i }));
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("shows notification bell and badge when logged in", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ username: "admin", role: "EMPLOYEE", image: "" })
        );
        // Mock notifications
        require("js-cookie").get.mockReturnValue(
            JSON.stringify([
                { id: 1, read: false, quantity: 2, title: "Movie A", invoiceId: "123" },
                { id: 2, read: true, quantity: 1, title: "Movie B", invoiceId: "456" },
            ])
        );
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Movies")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument(); // unread badge
        fireEvent.click(screen.getByTestId("bell-icon"));
        expect(screen.getByText(/Đã đặt 2 vé phim/)).toBeInTheDocument();
        expect(screen.getByText(/Movie A/)).toBeInTheDocument();
    });

    it("shows 'Không có thông báo' when no notifications exist", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ username: "admin", role: "EMPLOYEE", image: "" })
        );
        require("js-cookie").get.mockReturnValue(JSON.stringify([]));
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByTestId("bell-icon"));
        expect(screen.getByText("Không có thông báo")).toBeInTheDocument();
    });

    it("logs out and shows Sign In link", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ username: "admin", role: "EMPLOYEE", image: "" })
        );
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByRole("img", { name: /avatar/i }));
        fireEvent.click(screen.getByText("Logout"));
        expect(screen.getByText("Sign In")).toBeInTheDocument();
    });
});
