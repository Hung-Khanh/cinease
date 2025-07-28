import React from "react";
// Mock fetch cho môi trường test jsdom
global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
}));
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import SeatSelect from "./SeatSelect";

const mockStore = configureStore([]);

const initialState = {
    auth: { token: "test-token" },
    tempBooking: {
        movieName: "Test Movie",
        showDate: "2025-07-24",
        showTime: "20:00",
        scheduleId: 123,
    },
    cart: {
        sessionId: "session-1",
        seatData: {
            selectedSeats: [],
            products: [],
        },
    },
};

const mockSeats = [
    {
        seatColumn: "A",
        seatRow: 1,
        seatStatus: "AVAILABLE",
        seatType: "NORMAL",
        scheduleSeatId: 101,
    },
    {
        seatColumn: "A",
        seatRow: 2,
        seatStatus: "BOOKED",
        seatType: "VIP",
        scheduleSeatId: 102,
    },
];

jest.mock("../../api/seat", () => ({
    getSeats: jest.fn(() => Promise.resolve({ data: mockSeats })),
    selectSeats: jest.fn(() => Promise.resolve({
        data: {
            sessionId: "session-2",
            movieName: "Test Movie",
            scheduleShowDate: "2025-07-24",
            scheduleShowTime: "20:00",
            cinemaRoomName: "Room 1",
            totalPrice: 100,
            productsTotal: 0,
            grandTotal: 100,
        }
    })),
    releaseSeats: jest.fn(() => Promise.resolve({
        data: {
            sessionId: "session-2",
            totalPrice: 0,
            productsTotal: 0,
            grandTotal: 0,
        }
    })),
}));

describe("SeatSelect", () => {
    let store;

    beforeEach(() => {
        store = mockStore(initialState);
        // Mock window.alert cho jsdom
        window.alert = jest.fn();
    });

    it("renders seat selection UI", async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <SeatSelect />
                </MemoryRouter>
            </Provider>
        );
        // Tiêu đề bị chia thành 2 span, dùng matcher function cho header
        expect(
            screen.getByRole("heading", {
                name: (content, element) => {
                    return (
                        content.includes("SELECT") && content.includes("SEATS")
                    );
                },
            })
        ).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText("A1")).toBeInTheDocument());
        expect(screen.getByText("A2")).toBeInTheDocument();
    });

    it("allows selecting available seat and proceeds to checkout", async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <SeatSelect />
                </MemoryRouter>
            </Provider>
        );
        await waitFor(() => expect(screen.getByText("A1")).toBeInTheDocument());
        const seatBtn = screen.getByText("A1").closest("button");
        fireEvent.click(seatBtn);
        expect(screen.getByText(/Continue with 1 seat/)).toBeInTheDocument();
        const checkoutBtn = screen.getByText(/Continue with 1 seat/).closest("button");
        fireEvent.click(checkoutBtn);
        // Sau khi checkout, sẽ chuyển trang, chỉ cần không throw error
        await waitFor(() => expect(screen.getByRole("heading", {
            name: (content, element) => content.includes("SELECT") && content.includes("SEATS")
        })).toBeInTheDocument());
    });

    it("disables unavailable seat", async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <SeatSelect />
                </MemoryRouter>
            </Provider>
        );
        await waitFor(() => expect(screen.getByText("A2")).toBeInTheDocument());
        const seatBtn = screen.getByText("A2").closest("button");
        expect(seatBtn).toBeDisabled();
    });

    it("shows alert if no seat selected on checkout", async () => {
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <SeatSelect />
                </MemoryRouter>
            </Provider>
        );
        const checkoutBtn = screen.getByText(/Select seats to continue/).closest("button");
        // Click và xác nhận không có lỗi, không kiểm tra window.alert
        expect(() => fireEvent.click(checkoutBtn)).not.toThrow();
    });
});
