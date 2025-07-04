import api from "../constants/axios";

export const postSelectedSeats = async (
  scheduleId,
  scheduleSeatIds,
  productsForRequest
) => {
  try {
    const response = await api.post(
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
    return response;
  } catch (error) {
    alert(error);
    throw error;
  }
};

export const ConfirmBooking = async (
  invoiceId,
  scheduleId,
  memberId,
  ticketType,
  paymentMethod
) => {
  try {
    const response = await api.post(
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
    return response;
  } catch (error) {
    alert(error);
    throw error;
  }
};

export const checkMember = async (invoiceId, phoneNumber) => {
  try {
    const response = await api.post(
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
    return response;
  } catch (error) {
    alert(error);
    throw error;
  }
};

export const staffBookingSummary = async (invoiceId) => {
  try {
    const response = await api.get(
      `/employee/bookings/summary/{invoiceId}?invoiceId=${invoiceId}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    return response;
  } catch (error) {
    alert(error);
    throw error;
  }
};

export const getMovieList = async (movieName) => {
  try {
    const response = await api.get(`/public/movies?q=${movieName}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return response;
  } catch (error) {
    alert(error);
    throw error;
  }
};

export const applyDiscount = async (
  invoiceId,
  scheduleId,
  memberId,
  ticketType,
  userScore,
  promotionId
) => {
  try {
    const response = await api.post(
      `/employee/bookings/apply-discounts`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
      {
        invoiceId: invoiceId,
        scheduleId: scheduleId,
        memberId: memberId,
        ticketType: ticketType,
        userScore: userScore,
        promotionId: promotionId,
      }
    );
    return response;
  } catch (error) {
    alert(error);
    throw error;
  }
};
