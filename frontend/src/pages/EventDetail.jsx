import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // Lấy thông tin chi tiết của 1 sự kiện
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then(res => setEvent(res.data.data))
      .catch(error => console.error("Lỗi lấy chi tiết sự kiện:", error));
  }, [id]);

  const handleBookTicket = async () => {
    // Kiểm tra xem khách đã có "giấy thông hành" (Token) chưa
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      alert("Bạn cần đăng nhập để đặt vé nhé!");
      navigate('/login');
      return;
    }

    try {
      // Gọi API đặt vé xuống Backend
      await axios.post('http://localhost:5000/api/tickets', {
        user: user.id,
        event: id,
        quantity: 1, // Mặc định mua 1 vé cho đơn giản
        totalPrice: event.price
      }, {
        headers: { Authorization: `Bearer ${token}` } // Gửi kèm Token để qua chốt chặn
      });

      alert("🎉 Đặt vé thành công! Hẹn gặp bạn tại sự kiện!");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi đặt vé.");
    }
  };

  if (!event) return <div className="text-center mt-5 text-white">Đang tải dữ liệu...</div>;

  return (
    <div className="container mt-5 text-white">
      <div className="card bg-dark text-white border-secondary shadow-lg">
        <div className="card-header bg-primary text-center">
          <h2>{event.title}</h2>
        </div>
        <div className="card-body p-5">
          <div className="row">
            <div className="col-md-8">
              <h4 className="text-warning">Thông tin sự kiện</h4>
              <p className="fs-5"><strong>📍 Địa điểm:</strong> {event.location}</p>
              <p className="fs-5"><strong>📅 Thời gian:</strong> {new Date(event.startDate).toLocaleString('vi-VN')}</p>
              <p className="fs-5"><strong>🏷️ Danh mục:</strong> {event.category}</p>
              <hr className="border-secondary" />
              <h5>Mô tả chi tiết:</h5>
              <p className="text-muted">
                Tham gia sự kiện này để có những trải nghiệm tuyệt vời nhất. 
                (Bạn có thể thêm trường description vào Database sau này nếu muốn ghi chú dài hơn).
              </p>
            </div>
            <div className="col-md-4 text-center border-start border-secondary">
              <h3 className="text-danger mb-4">Giá vé: {event.price.toLocaleString()} VNĐ</h3>
              <button 
                className="btn btn-success btn-lg w-100 py-3 fw-bold" 
                onClick={handleBookTicket}
              >
                🎟️ ĐẶT VÉ NGAY
              </button>
              <button 
                className="btn btn-outline-light w-100 mt-3" 
                onClick={() => navigate('/')}
              >
                Quay lại Trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;