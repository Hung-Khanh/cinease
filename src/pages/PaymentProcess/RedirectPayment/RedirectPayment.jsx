import React from 'react';
import { Spin } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';

const RedirectPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const params = Object.fromEntries(searchParams.entries());

  React.useEffect(() => {
    const responseCode = params.vnp_ResponseCode;
    if (responseCode === '00') {
      // Thành công
      navigate(`/user-payment-success?invoiceId=${params.vnp_TxnRef}`, { replace: true });
    } else {
      // Thất bại
      navigate('/user-payment-failed', { 
        state: {
          errorCode: responseCode,
          errorMessage: params.vnp_ResponseMessage || 'Thanh toán thất bại'
        },
        replace: true
      });
    }
  }, [navigate, params]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin size="large" tip="Đang chuyển hướng..." />
    </div>
  );
};

export default RedirectPayment;