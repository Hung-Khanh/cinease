// SeatSelect.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SeatSelect from "./TestSeatSelection";
import { BrowserRouter } from "react-router-dom";

// Mock react-redux (bỏ Provider, không dùng store)
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn(() => ({
  scheduleId: "1",
  movieName: "Oppenheimer",
  selectedDate: "2025-07-20",
  selectedTime: "19:30",
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useLocation: () => ({
    state: {
      selectedSeats: ["A1"],
    },
  }),
}));

// Mock API
jest.mock("../../../api/seat", () => ({
  getSeats: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          seatColumn: "A",
          seatRow: 1,
          seatStatus: "AVAILABLE",
          seatType: "REGULAR",
          scheduleSeatId: 123,
        },
      ],
    })
  ),
}));

jest.mock("../../../api/promotion", () => ({
  StaffGetPromotions: jest.fn(() =>
    Promise.resolve({
      data: [],
    })
  ),
}));

jest.mock("../../../api/staff", () => ({
  postSelectedSeats: jest.fn(() =>
    Promise.resolve({
      data: { invoiceId: "456" },
    })
  ),
}));

// TEST
describe("SeatSelect (no Redux store)", () => {
  beforeEach(() => {
    const { useSelector } = require("react-redux");
    useSelector.mockImplementation((selectorFn) =>
      selectorFn({ auth: { token: "mockToken" } })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders screen and legends", async () => {
    render(
      <BrowserRouter>
        <SeatSelect />
      </BrowserRouter>
    );

    expect(await screen.findByText("Screen")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
  });

  test("renders seat from location state", async () => {
    render(
      <BrowserRouter>
        <SeatSelect />
      </BrowserRouter>
    );

    expect(await screen.findByText("A1")).toBeInTheDocument();
  });
});
