import React from "react";
import { render, screen } from "@testing-library/react";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useSearchParams: jest.fn(),
}));

jest.mock("antd", () => {
    const antd = jest.requireActual("antd");
    return {
        ...antd,
        Spin: (props) => <div data-testid="spin">{props.tip}</div>,
    };
});

describe("RedirectPayment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading spinner", () => {
        const { useSearchParams } = require("react-router-dom");
        useSearchParams.mockReturnValue([{
            entries: () => Object.entries({}),
        }]);
        const RedirectPayment = require("./RedirectPayment").default;
        render(<RedirectPayment />);
        expect(screen.getByTestId("spin")).toHaveTextContent("Đang chuyển hướng...");
    });

    it("redirects to success page if vnp_ResponseCode is '00'", () => {
        const { useSearchParams } = require("react-router-dom");
        useSearchParams.mockReturnValue([{
            entries: () => Object.entries({
                vnp_ResponseCode: "00",
                vnp_TxnRef: "INV123",
            }),
        }]);
        const RedirectPayment = require("./RedirectPayment").default;
        render(<RedirectPayment />);
        expect(mockNavigate).toHaveBeenCalledWith("/user-payment-success?invoiceId=INV123", { replace: true });
    });

    it("redirects to failed page if vnp_ResponseCode is not '00'", () => {
        const { useSearchParams } = require("react-router-dom");
        useSearchParams.mockReturnValue([{
            entries: () => Object.entries({
                vnp_ResponseCode: "01",
                vnp_ResponseMessage: "Lỗi thanh toán",
            }),
        }]);
        const RedirectPayment = require("./RedirectPayment").default;
        render(<RedirectPayment />);
        expect(mockNavigate).toHaveBeenCalledWith("/user-payment-failed", {
            state: {
                errorCode: "01",
                errorMessage: "Lỗi thanh toán",
            },
            replace: true,
        });
    });

    it("redirects to failed page with default message if vnp_ResponseMessage is missing", () => {
        const { useSearchParams } = require("react-router-dom");
        useSearchParams.mockReturnValue([{
            entries: () => Object.entries({
                vnp_ResponseCode: "02",
            }),
        }]);
        const RedirectPayment = require("./RedirectPayment").default;
        render(<RedirectPayment />);
        expect(mockNavigate).toHaveBeenCalledWith("/user-payment-failed", {
            state: {
                errorCode: "02",
                errorMessage: "Thanh toán thất bại",
            },
            replace: true,
        });
    });
});
