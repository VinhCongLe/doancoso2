import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../services/api';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Import Swiper React components và styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    // 1. Gọi API lấy danh sách Sự kiện
    fetchEvents()
      .then(res => setEvents(res.data.data))
      .catch(err => console.error("Lỗi lấy sự kiện:", err));

    // 2. Gọi API lấy danh sách Banner
    axios.get('http://localhost:5000/api/banners')
      .then(res => setBanners(res.data.data))
      .catch(err => console.error("Lỗi lấy banner:", err));
  }, []);

  return (
    <div className="container mt-4 mb-5">
      {/* --- PHẦN 1: SLIDE BANNER --- */}
      {banners.length > 0 && (
        <div className="mb-5 shadow-lg rounded overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            style={{ height: '400px' }}
          >
            {banners.map(banner => (
              <SwiperSlide key={banner._id}>
                <div className="position-relative w-100 h-100">
                  <img 
                    src={`http://localhost:5000${banner.image}`} 
                    alt={banner.title}
                    className="d-block w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  {/* Lớp phủ mờ và Tiêu đề trên Banner */}
                  <div className="position-absolute bottom-0 start-0 w-100 p-4" 
                       style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <h2 className="text-white fw-bold mb-0">{banner.title}</h2>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* --- PHẦN 2: DANH SÁCH SỰ KIỆN --- */}
      <h1 className="text-center mb-5 text-warning fw-bold text-uppercase">
        Danh Sách Sự Kiện Sắp Diễn Ra
      </h1>
      
      <div className="row">
        {events.map(event => (
          <div className="col-md-4 mb-4" key={event._id}>
            <div className="card h-100 shadow-sm bg-dark text-white border-secondary card-hover">
              {/* Ảnh bìa sự kiện */}
              {event.banner ? (
                <img 
                  src={`http://localhost:5000${event.banner}`} 
                  alt={event.title} 
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }} 
                />
              ) : (
                <div className="bg-secondary d-flex align-items-center justify-content-center" style={{height: '200px'}}>
                  <span className="text-muted">No Image</span>
                </div>
              )}

              <div className="card-body d-flex flex-column">
                <span className="badge bg-primary mb-2 align-self-start">{event.category}</span>
                <h5 className="card-title text-uppercase font-weight-bold text-truncate">{event.title}</h5>
                <div className="card-text text-muted mb-3">
                   <div className="mb-1">📍 {event.location}</div>
                   <div>📅 {new Date(event.startDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <p className="text-danger fs-5 fw-bold mt-auto">
                  {event.price.toLocaleString()} VNĐ
                </p>
                <Link to={`/event/${event._id}`} className="btn btn-warning w-100 fw-bold">
                  Xem Chi Tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center text-muted py-5 w-100">
             <h3>Hiện chưa có sự kiện nào được đăng tải.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;