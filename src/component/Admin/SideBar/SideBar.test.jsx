import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SideBar from "../SideBar";

jest.mock("../../../assets/logo.png", () => "logo.png");
jest.mock("../../../assets/admin-logo/dashboard-icon.svg", () => "dashboard-icon.svg");
jest.mock("../../../assets/admin-logo/employees-icon.svg", () => "employees-icon.svg");
jest.mock("../../../assets/admin-logo/movies-icon.svg", () => "movies-icon.svg");
jest.mock("../../../assets/admin-logo/promotions-icon.svg", () => "promotions-icon.svg");
jest.mock("../../../assets/admin-logo/cinema-icon.svg", () => "cinema-icon.svg");
jest.mock("../../../assets/admin-logo/ticket-icon.svg", () => "ticket-icon.svg");
jest.mock("../../../assets/admin-logo/member-icon.svg", () => "member-icon.svg");
jest.mock("../../../assets/admin-logo/popcorn-icon.svg", () => "popcorn-icon.svg");

describe("Admin SideBar", () => {
    test("renders all menu items and logo", () => {
        render(
            <BrowserRouter>
                <SideBar isVisible={true} />
            </BrowserRouter>
        );
        expect(screen.getByAltText("Cinease Logo")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Employees")).toBeInTheDocument();
        expect(screen.getByText("Membership")).toBeInTheDocument();
        expect(screen.getByText("Movies")).toBeInTheDocument();
        expect(screen.getByText("Promotions")).toBeInTheDocument();
        expect(screen.getByText("Cinema Rooms")).toBeInTheDocument();
        expect(screen.getByText("Tickets Management")).toBeInTheDocument();
        expect(screen.getByText("Products Management")).toBeInTheDocument();
    });

    test("calls onMenuItemClick when menu item clicked", () => {
        const mockMenuClick = jest.fn();
        render(
            <BrowserRouter>
                <SideBar isVisible={true} onMenuItemClick={mockMenuClick} />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText("Movies"));
        expect(mockMenuClick).toHaveBeenCalledWith("MOVIES");
    });

    test("sidebar is hidden when isVisible is false", () => {
        render(
            <BrowserRouter>
                <SideBar isVisible={false} />
            </BrowserRouter>
        );
        expect(screen.getByRole("complementary")).toHaveClass("hidden");
    });
});
