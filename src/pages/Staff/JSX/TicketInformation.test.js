import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TicketInformation from "./TicketInformation";
import { MemoryRouter } from "react-router-dom";
import * as api from "../../../api/staff";
import userEvent from "@testing-library/user-event";

// Mock window.alert to prevent JSDOM error
beforeAll(() => {
  window.alert = jest.fn();
});

jest.mock("../../../api/staff");

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ invoiceId: "1", scheduleId: "2" }),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: { memberId: 1001, maxScoreUsage: 10 },
  }),
}));

describe("TicketInformation component", () => {
  beforeEach(() => {
    localStorage.setItem("token", "mock-token");

    api.staffBookingSummary.mockResolvedValue({
      data: {
        movieName: "Test Movie",
        seatNumbers: ["A1", "A2"],
        scheduleShowDate: "2025-07-20",
        scheduleShowTime: "2025-07-20T19:00:00",
      },
    });

    api.getMovieList.mockResolvedValue({
      data: [{ posterImageUrl: "test-poster.jpg", cinemaRoomId: "Room 1" }],
    });

    api.applyDiscount.mockResolvedValue({
      data: {
        finalPrice: 200000,
      },
    });

    api.confirmPayment.mockResolvedValue({
      data: {
        paymentUrl: "https://payment.vn",
        finalAmount: 200000,
        invoiceId: 999,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders movie information", async () => {
    render(<TicketInformation />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
      expect(screen.getByText(/A1, A2/)).toBeInTheDocument();
      expect(screen.getByText("20/07/2025")).toBeInTheDocument();
      expect(screen.getByText("19:00:00")).toBeInTheDocument();
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
  });

  test("handles VNPAY payment flow", async () => {
    render(<TicketInformation />, { wrapper: MemoryRouter });

    // Enter voucher
    await userEvent.type(
      screen.getByPlaceholderText("Search voucher by title..."),
      "VOUCHER"
    );

    // Confirm VNPAY is selected (default)
    expect(screen.getByRole("button", { name: /VNPAY/ })).toBeInTheDocument();

    // Click Confirm to open modal
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      const totalElements = screen.getAllByText(/Total:/);
      expect(
        totalElements.find((el) => el.closest(".ant-modal"))
      ).toBeInTheDocument();
    });

    // Click Purchase in the modal
    fireEvent.click(screen.getByRole("button", { name: /Purchase/i }));

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/confirm-purchase", {
        state: {
          paymentUrl: "https://payment.vn",
          totalPrice: 200000,
        },
      })
    );
  });
});
