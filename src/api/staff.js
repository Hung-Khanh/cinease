import api from "../constants/axios";

export const postSelectedSeats = async (
  scheduleId,
  scheduleSeatIds,
  productsForRequest
) => {
  return api.post(
    "/employee/bookings/select-seats",
    {
      scheduleId: parseInt(scheduleId),
      scheduleSeatIds,
      products: productsForRequest,
    },
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
};

export const ConfirmBooking = async (
  invoiceId,
  scheduleId,
  memberId,
  ticketType,
  paymentMethod
) => {
  return api.post(
    `/employee/bookings/confirm`,
    {
      invoiceId: invoiceId,
      scheduleId: scheduleId,
      memberId: memberId,
      ticketType: ticketType,
      paymentMethod: paymentMethod,
    },
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
};

export const checkMember = async (invoiceId, phoneNumber) => {
  return api.post(
    `/employee/bookings/check-member`,
    {
      invoiceId: invoiceId,
      phoneNumber: phoneNumber,
    },
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
    }
  );
};
