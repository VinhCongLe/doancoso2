import React, { useEffect, useState, useRef } from 'react';
import { fetchEvents } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// Swiper imports 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('q') || '';

  useEffect(() => {
    fetchEvents()
      .then(res => setEvents(res.data.data))
      .catch(err => console.error("Lỗi lấy sự kiện:", err));
  }, []);

  /* ── Formatters ── */
  const formatPrice = (price) => price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')} ₫`;

  const formatDateString = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  /* ── Data Categorization ── */
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // 1. Featured Events (Hero Slider)
  const featuredEvents = events.filter(e => e.isFeatured);

  // Fallback to latest event if no featured events are selected
  const heroEvents = featuredEvents.length > 0 ? featuredEvents : (events.length > 0 ? [events[0]] : []);

  // 2. Ongoing Events 
  const ongoingEvents = events.filter(e => {
    const d = new Date(e.startDate);
    d.setHours(0, 0, 0, 0);
    return d <= currentDate;
  });

  // 3. Upcoming Events (date > current)
  const upcomingEvents = events.filter(e => {
    const d = new Date(e.startDate);
    d.setHours(0, 0, 0, 0);
    return d > currentDate;
  });

  // 4. Search Results 
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.categoryId && e.categoryId.name && e.categoryId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /* ── Reusable Event Card Component ── */
  const EventCard = ({ event }) => {
    return (
      <Link to={`/event/${event._id}`} className="ec-card" style={{ textDecoration: 'none' }}>
        <div className="ec-card-img-wrap">
          {event.banner ? (
            <img src={`http://localhost:5000${event.banner}`} alt={event.title} className="ec-card-img" />
          ) : (
            <div className="ec-card-img-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6V4A2 2 0 0 1 6 2H18A2 2 0 0 1 20 4V6H21A1 1 0 0 1 22 7V17A1 1 0 0 1 21 18H20V20A2 2 0 0 1 18 22H6A2 2 0 0 1 4 20V18H3A1 1 0 0 1 2 17V7A1 1 0 0 1 3 6H4ZM6 4V6H18V4H6ZM4 8H20V16H4V8ZM6 18V20H18V18H6ZM10 10H14V14H10V10Z" /></svg>
              <span>No Image</span>
            </div>
          )}
          <span className="ec-category-badge">{event.categoryId?.name || event.category}</span>

          <button
            className="ec-fav-btn"
            onClick={(e) => {
              e.preventDefault();
              // For demo purposes, we just toggle based on random state or just show success
              // In a real app we'd save to local storage or API
              toast.success("Đã thêm vào yêu thích");
            }}
            aria-label="Add to favorites"
          >
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </button>
        </div>
        <div className="ec-card-body">
          <div className="ec-card-date" style={{ color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '0.4rem' }}>
            {formatDateString(event.startDate)}
          </div>
          <h3 className="ec-card-title" title={event.title}>{event.title}</h3>
          <div className="ec-meta-list" style={{ marginTop: '0.5rem', marginBottom: 'auto' }}>
            <div className="ec-meta-item">
              <svg className="ec-meta-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="ec-meta-text">{event.location}</span>
            </div>
          </div>
          <div className="ec-card-footer">
            <div className="ec-price">{formatPrice(event.price)}</div>
            <div className="ec-cta-btn">Mua Vé</div>
          </div>
        </div>
      </Link>
    );
  };

  /* ── Reusable Carousel Component ── */
  const EventCarousel = ({ title, subtitle, eventList }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    if (eventList.length === 0) return null;

    return (
      <div className="events-section">
        <div className="relative flex justify-center items-center mb-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-400 mt-2">
                {subtitle}
              </p>
            )}
          </div>

          <div className="carousel-nav-group absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex">
            <button ref={prevRef} className="carousel-arrow" aria-label="Previous">‹</button>
            <button ref={nextRef} className="carousel-arrow" aria-label="Next">›</button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          pagination={{ clickable: true, el: '.events-pagination', bulletClass: 'ev-dot', bulletActiveClass: 'ev-dot-active' }}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="events-swiper"
        >
          {eventList.map(ev => (
            <SwiperSlide key={ev._id}>
              <EventCard event={ev} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination dots container */}
        <div className="events-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }} />
      </div>
    );
  };

  return (
    <div className="home-page">


      {/* ── CONDITIONAL RENDERING: SEARCH RESULTS VS HOME VIEW ── */}
      {searchTerm.trim() !== '' ? (
        <div style={{ padding: '0 1rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Kết quả tìm kiếm cho "{searchTerm}"
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Tìm thấy {filteredEvents.length} sự kiện
          </p>

          {filteredEvents.length > 0 ? (
            <div className="search-results-grid">
              {filteredEvents.map(ev => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          ) : (
            <div className="search-results-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Không tìm thấy sự kiện nào</h3>
              <p>Vui lòng thử lại với từ khóa khác.</p>
              <Link
                to="/"
                style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
              >
                Xóa tìm kiếm
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 1. HERO / FEATURED EVENTS CAROUSEL */}
          {heroEvents.length > 0 && (
            <div className="hero-carousel-wrapper">
              <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                slidesPerView={1}
                loop={heroEvents.length > 1}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className="hero-swiper"
              >
                {heroEvents.map((event) => (
                  <SwiperSlide key={event._id}>
                    <div className="hero-section">
                      {event.banner ? (
                        <img src={`http://localhost:5000${event.banner}`} alt={event.title} className="hero-img" />
                      ) : (
                        <div className="hero-img" style={{ background: 'var(--bg-surface)' }} />
                      )}

                      <div className="hero-overlay">
                        <div className="hero-content">
                          <span className="hero-badge">🔥 SỰ KIỆN NỔI BẬT</span>
                          <h1 className="hero-title">{event.title}</h1>

                          <div className="hero-details">
                            <span className="hero-detail-item">
                              <svg className="hero-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {formatDateString(event.startDate)}
                            </span>
                            <span className="hero-detail-item">
                              <svg className="hero-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {event.location}
                            </span>
                            <span className="hero-detail-item">
                              <span className="hero-cat-pill">
                                {event.category}
                              </span>
                            </span>
                          </div>

                          <div className="hero-actions">
                            <div className="hero-price">{formatPrice(event.price)}</div>
                            <Link to={`/event/${event._id}`} className="hero-btn">
                              Mua Vé Ngay
                              <svg className="hero-icon" style={{ marginLeft: '0.5rem' }} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          <div style={{ padding: '2rem 0' }}>

            {/* 2. SỰ KIỆN ĐANG DIỄN RA (CAROUSEL) */}
            <div style={{ marginBottom: '4rem' }}>
              <EventCarousel
                title="Sự Kiện Đang Diễn Ra"
                subtitle="Khám phá và đặt vé cho những sự kiện hot nhất đang diễn ra hôm nay"
                eventList={ongoingEvents}
              />
            </div>

            {/* 3. SỰ KIỆN SẮP DIỄN RA (CAROUSEL) */}
            <div style={{ marginBottom: '4rem' }}>
              <EventCarousel
                title="Sự Kiện Sắp Diễn Ra"
                subtitle="Chuẩn bị trọn vẹn sẵn sàng cho những sự kiện bùng nổ sắp tới"
                eventList={upcomingEvents}
              />
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Home;