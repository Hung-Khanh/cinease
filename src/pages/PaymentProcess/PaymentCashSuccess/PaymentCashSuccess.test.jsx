// Mocks for react-router-dom
const mockNavigate = jest.fn();
const mockLocation = { state: { invoiceId: "INV123" } };

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => mockLocation,
    useNavigate: () => mockNavigate,
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import PaymentCashSuccess from "./PaymentCashSuccess";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../../api/staff", () => ({
    staffBookingSummary: jest.fn(),
}));

global.fetch = jest.fn();

describe("PaymentCashSuccess", () => {
    const ticketMock = {
        movieName: "Test Movie",
        cinemaRoomName: "Room 1",
        scheduleShowDate: "2025-07-24T10:00:00Z",
        seatNumbers: ["A1", "A2"],
        scheduleShowTime: "10:00",
        ticketCount: 2,
        grandTotal: 200000,
        status: "SUCCESS",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("token", "test-token");
        localStorage.setItem("role", "EMPLOYEE");
    });

    it("renders loading state initially", async () => {
        require("../../../api/staff").staffBookingSummary.mockResolvedValue({ data: ticketMock });
        fetch.mockResolvedValue({ ok: true, json: async () => [{ largeImage: "poster-url" }] });
        render(
            <MemoryRouter>
                <PaymentCashSuccess />
            </MemoryRouter>
        );
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText(/^Ticket$/)).toBeInTheDocument());
    });

    it("renders ticket info after fetch", async () => {
        require("../../../api/staff").staffBookingSummary.mockResolvedValue({ data: ticketMock });
        fetch.mockResolvedValue({ ok: true, json: async () => [{ largeImage: "poster-url" }] });
        render(
            <MemoryRouter>
                <PaymentCashSuccess />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText("Test Movie")).toBeInTheDocument());
        expect(screen.getByText("Room 1")).toBeInTheDocument();
        expect(screen.getByText("A1, A2")).toBeInTheDocument();
        expect(screen.getByText("10:00")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText(/200,000 VND/)).toBeInTheDocument();
        expect(screen.getByText("SUCCESS")).toBeInTheDocument();
    });

    it("navigates back to home page when button clicked", async () => {
        require("../../../api/staff").staffBookingSummary.mockResolvedValue({ data: ticketMock });
        fetch.mockResolvedValue({ ok: true, json: async () => [{ largeImage: "poster-url" }] });
        render(
            <MemoryRouter>
                <PaymentCashSuccess />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText(/Back to Home page/)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Back to Home page/));
        expect(mockNavigate).toHaveBeenCalledWith("/staffHomePage");
    });
});
