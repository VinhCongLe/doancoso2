import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EventForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    location: '',
    startDate: '',
    price: 0,
    availableTickets: 100,
    description: '',
    isFeatured: false
  });

  const [categories, setCategories] = useState([]);

  // 1. Thêm 2 State mới để quản lý ảnh
  const [bannerFile, setBannerFile] = useState(null); // Lưu file thật để gửi đi
  const [previewUrl, setPreviewUrl] = useState('');   // Lưu đường dẫn ảo để xem trước ảnh

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Tải danh sách loại sự kiện
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data.data))
      .catch(err => console.error("Lỗi tải loại sự kiện:", err));

    if (id) {
      axios.get(`http://localhost:5000/api/events/${id}`)
        .then(res => {
          const data = res.data.data;
          if (data.startDate) data.startDate = data.startDate.split('T')[0];
          setFormData({
            title: data.title,
            categoryId: data.categoryId?._id || data.categoryId || '',
            location: data.location,
            startDate: data.startDate,
            price: data.price,
            availableTickets: data.availableTickets || 100,
            description: data.description || '',
            isFeatured: data.isFeatured || false
          });
          if (data.banner) {
            setPreviewUrl(`http://localhost:5000${data.banner}`);
          }
        })
        .catch(error => console.error("Lỗi tải dữ liệu:", error));
    }
  }, [id]);

  // Hàm xử lý khi người dùng chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo link ảo để hiện ảnh ngay lập tức
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. Dùng FormData thay vì JSON để chứa được file ảnh
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('categoryId', formData.categoryId);
    submitData.append('location', formData.location);
    submitData.append('startDate', formData.startDate);
    submitData.append('price', formData.price);
    submitData.append('availableTickets', formData.availableTickets);
    submitData.append('description', formData.description);
    submitData.append('isFeatured', formData.isFeatured);

    // Nếu có chọn ảnh mới thì mới đính kèm vào
    if (bannerFile) {
      submitData.append('banner', bannerFile); // Chữ 'banner' này phải khớp với cấu hình Multer ở Backend
    }

    try {
      const token = localStorage.getItem('token');
      // Axios rất thông minh, khi thấy FormData nó sẽ tự động cấu hình Content-Type là multipart/form-data
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (id) {
        await axios.put(`http://localhost:5000/api/events/${id}`, submitData, config);
        alert("Cập nhật sự kiện thành công!");
      } else {
        await axios.post('http://localhost:5000/api/events', submitData, config);
        alert("Thêm sự kiện thành công!");
      }
      navigate('/admin');
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      alert("Đã có lỗi xảy ra, vui lòng kiểm tra lại!");
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="tp-page-header">
        <h1 className="tp-page-title">
          {id ? 'Chỉnh Sửa Sự Kiện' : 'Thêm Sự Kiện Mới'}
        </h1>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row g-4">
          {/* Left: Event fields */}
          <div className="col-lg-8">
            <div className="tp-card">
              <div className="tp-card-body">
                <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.2rem' }}>
                  Thông tin sự kiện
                </div>

                {/* Tên sự kiện */}
                <div className="tp-form-group">
                  <label className="tp-label">Tên sự kiện *</label>
                  <input
                    type="text"
                    className="tp-input"
                    placeholder="Nhập tên sự kiện..."
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-3">
                  {/* Danh mục */}
                  <div className="col-md-6">
                    <div className="tp-form-group">
                      <label className="tp-label">Loại sự kiện *</label>
                      <select
                        className="tp-input"
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                        style={{ appearance: 'auto' }}
                      >
                        <option value="">-- Chọn loại sự kiện --</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Ngày diễn ra */}
                  <div className="col-md-6">
                    <div className="tp-form-group">
                      <label className="tp-label">Ngày diễn ra *</label>
                      <input
                        type="date"
                        className="tp-input"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  {/* Giá vé */}
                  <div className="col-md-6">
                    <div className="tp-form-group">
                      <label className="tp-label">Giá vé (VNĐ) *</label>
                      <input
                        type="number"
                        className="tp-input"
                        placeholder="0"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  {/* Tổng số vé */}
                  <div className="col-md-6">
                    <div className="tp-form-group">
                      <label className="tp-label">Tổng số vé bán ra *</label>
                      <input
                        type="number"
                        className="tp-input"
                        placeholder="100"
                        value={formData.availableTickets}
                        onChange={e => setFormData({ ...formData, availableTickets: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Địa điểm */}
                <div className="tp-form-group" style={{ marginBottom: 0 }}>
                  <label className="tp-label">Địa điểm tổ chức *</label>
                  <input
                    type="text"
                    className="tp-input"
                    placeholder="Nhập địa điểm..."
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                {/* Mô tả sự kiện */}
                <div className="tp-form-group" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
                  <label className="tp-label">Mô Tả Sự Kiện</label>
                  <textarea
                    name="description"
                    placeholder="Nhập mô tả chi tiết cho sự kiện..."
                    className="tp-input"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    rows="4"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Checkbox: Sự kiện nổi bật */}
                <div className="tp-form-group" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
                  <label className="tp-checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div className="tp-checkbox-wrapper" style={{ position: 'relative', width: '20px', height: '20px' }}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                        style={{ width: '100%', height: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      🔥 Đánh dấu là sự kiện nổi bật (Hiển thị trên Slide đầu trang)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Banner upload */}
          <div className="col-lg-4">
            <div className="tp-card">
              <div className="tp-card-body">
                <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.2rem' }}>
                  Ảnh Banner
                </div>

                {/* Image preview */}
                <div className="img-preview-box">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" />
                  ) : (
                    <div className="img-preview-placeholder">
                      <span>🖼️</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-disabled)', margin: 0 }}>Chưa có ảnh</p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  className="tp-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', display: 'block', marginTop: '0.5rem' }}>
                  Hỗ trợ: JPG, PNG, WEBP
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost-tp" onClick={() => navigate('/admin')}>
            Hủy bỏ
          </button>
          <button type="submit" className="btn-primary-tp" style={{ padding: '0.65rem 2rem' }}>
            {id ? '💾 Cập Nhật Sự Kiện' : '🚀 Đăng Sự Kiện'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;