import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PhoneInput from "./InputPhoneNumber";
import * as api from "../../../api/staff";

jest.mock("../../../api/staff", () => ({
  checkMember: jest.fn(),
}));

describe("PhoneInput Component", () => {
  const setup = () => {
    return render(
      <MemoryRouter initialEntries={["/input-phone/123/456"]}>
        <Routes>
          <Route
            path="/input-phone/:invoiceId/:scheduleId"
            element={<PhoneInput />}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it("should render input and keypad", () => {
    const { getByText, getByPlaceholderText } = setup();

    expect(getByText("Enter your phone number")).toBeInTheDocument();
    expect(getByPlaceholderText("Your phone number")).toBeInTheDocument();
  });

  it("should show error when phone is empty", async () => {
    const { getByText } = setup();

    fireEvent.click(getByText("SUBMIT"));
    await waitFor(() => {
      expect(getByText("Vui lòng nhập số điện thoại")).toBeInTheDocument();
    });
  });

  it("should show error when phone number has less than 10 digits", async () => {
    const { getByText, getByPlaceholderText } = setup();

    fireEvent.click(getByText("1"));
    fireEvent.click(getByText("2"));
    fireEvent.click(getByText("3"));
    fireEvent.click(getByText("4"));
    fireEvent.click(getByText("5"));
    fireEvent.click(getByText("6"));
    fireEvent.click(getByText("7"));
    fireEvent.click(getByText("8"));
    fireEvent.click(getByText("9"));

    fireEvent.click(getByText("SUBMIT"));
    await waitFor(() => {
      expect(
        getByText("Số điện thoại phải có ít nhất 10 chữ số")
      ).toBeInTheDocument();
    });
  });

  it("should call API and open modal on valid phone", async () => {
    const { getByText } = setup();

    api.checkMember.mockResolvedValue({
      data: {
        memberPhone: "0123456789",
        memberName: "Test User",
        availableScore: 100,
        estimatedEarnedScore: 10,
      },
    });

    for (let digit of "0123456789") {
      fireEvent.click(getByText(digit));
    }

    fireEvent.click(getByText("SUBMIT"));

    await waitFor(() => {
      expect(getByText("Confirm your information")).toBeInTheDocument();
      expect(getByText("0123456789")).toBeInTheDocument();
      expect(getByText("Test User")).toBeInTheDocument();
    });
  });
});
