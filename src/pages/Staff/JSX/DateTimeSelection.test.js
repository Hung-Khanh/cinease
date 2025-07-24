import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DateTimeSelection from "./DateTimeSelection";
import "@testing-library/jest-dom";

// Mock fetch API
beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url) => {
    if (url.includes("/public/movies")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: 1,
            movieNameVn: "Avatar",
            posterImageUrl: "http://example.com/poster.jpg",
            largeImage: "http://example.com/banner.jpg",
          },
        ],
      });
    }
    if (url.includes("/public/showtimes")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          movies: [
            {
              id: 1,
              title: "Avatar",
              showtimes: [
                {
                  scheduleId: 101,
                  showDate: "2025-07-20",
                  showTime: "10:00",
                },
                {
                  scheduleId: 102,
                  showDate: "2025-07-20",
                  showTime: "13:00",
                },
                {
                  scheduleId: 103,
                  showDate: "2025-07-21",
                  showTime: "12:00",
                },
              ],
            },
          ],
        }),
      });
    }
  });

  // Mock localStorage
  Storage.prototype.getItem = jest.fn(() => "mock-token");
});

afterEach(() => {
  jest.clearAllMocks();
});

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/staff/dateTimeSelection/1"]}>
      <Routes>
        <Route
          path="/staff/dateTimeSelection/:movieId"
          element={<DateTimeSelection apiUrl="http://example.com" />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("DateTimeSelection", () => {
  test("hiển thị phim và disable nút Next khi chưa chọn gì", async () => {
    renderWithRoute();

    // Chờ văn bản "Avatar" xuất hiện
    await waitFor(() => {
      expect(screen.getByText("Avatar")).toBeInTheDocument();
    });

    // Kiểm tra nút Next bị vô hiệu hóa
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();
  });

  test("chọn ngày và giờ chiếu thành công", async () => {
    renderWithRoute();

    // Chờ văn bản "Avatar" xuất hiện
    await waitFor(() => {
      expect(screen.getByText("Avatar")).toBeInTheDocument();
    });

    // Tìm nút ngày đầu tiên thay vì tìm "20 Tháng 7"
    const dateButtons = await screen.findAllByRole("button");
const dateButton = dateButtons.find(btn => btn.textContent.includes("Jul"));
expect(dateButton).toBeDefined(); // Ensure button is found
fireEvent.click(dateButton);
    expect(dateButton).toBeInTheDocument();
    fireEvent.click(dateButton);
    expect(dateButton).toHaveClass("selected");

    // Chờ và chọn giờ
    await waitFor(() => {
      expect(screen.getByText(/10:00/)).toBeInTheDocument();
    });

    const timeButton = screen.getByText(/10:00/);
    fireEvent.click(timeButton);

    // Kiểm tra nút Next được bật
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeEnabled();
  });
});
