import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

jest.mock("../../assets/logo.png", () => "logo.png");

describe("Footer", () => {
    test("renders logo and description", () => {
        render(<Footer />);
        expect(screen.getByAltText("Cinease Logo")).toBeInTheDocument();
        expect(screen.getByText(/Vietnam's leading modern cinema system/i)).toBeInTheDocument();
    });

    test("renders all footer columns and titles", () => {
        render(<Footer />);
        expect(screen.getByText("Cinease Cinema")).toBeInTheDocument();
        expect(screen.getByText("Support")).toBeInTheDocument();
        expect(screen.getByText("Contact")).toBeInTheDocument();
        expect(screen.getByText("Accepted Payments")).toBeInTheDocument();
    });

    test("renders social and payment icons", () => {
        render(<Footer />);
        expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(4); // social links
        expect(screen.getAllByText((content, element) => element.className.includes("payment-icon")).length).toBeGreaterThanOrEqual(4); // payment icons
    });

    test("renders copyright", () => {
        render(<Footer />);
        expect(screen.getByText(/© 2025 Cinease Cinema/i)).toBeInTheDocument();
    });
});
