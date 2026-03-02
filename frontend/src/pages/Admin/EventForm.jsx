import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EventForm = () => {
  const [formData, setFormData] = useState({
    title: '', 
    category: '', 
    location: '', 
    startDate: '', 
    price: 0,
    availableTickets: 100 // Thêm trường số lượng vé mặc định
  });
  
  // 1. Thêm 2 State mới để quản lý ảnh
  const [bannerFile, setBannerFile] = useState(null); // Lưu file thật để gửi đi
  const [previewUrl, setPreviewUrl] = useState('');   // Lưu đường dẫn ảo để xem trước ảnh

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/events/${id}`)
        .then(res => {
          const data = res.data.data;
          if (data.startDate) data.startDate = data.startDate.split('T')[0];
          setFormData({
            title: data.title,
            category: data.category,
            location: data.location,
            startDate: data.startDate,
            price: data.price,
            availableTickets: data.availableTickets || 100
          });
          // Nếu sự kiện cũ đã có ảnh, tải ảnh đó lên để xem trước
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
    submitData.append('category', formData.category);
    submitData.append('location', formData.location);
    submitData.append('startDate', formData.startDate);
    submitData.append('price', formData.price);
    submitData.append('availableTickets', formData.availableTickets);
    
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
    <div className="container mt-4 mb-5">
      <div className="card p-4 shadow bg-dark text-white border-secondary">
        <h3 className="mb-4 text-center text-warning fw-bold">
          {id ? "Chỉnh Sửa Sự Kiện" : "Thêm Sự Kiện Mới"}
        </h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          
          <div className="row">
            <div className="col-md-8">
              {/* Tên sự kiện */}
              <div className="mb-3">
                <label className="form-label text-info">Tên sự kiện</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div className="row">
                {/* Danh mục */}
                <div className="col-md-6 mb-3">
                  <label className="form-label text-info">Danh mục</label>
                  <input type="text" className="form-control bg-dark text-white border-secondary" 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                </div>
                {/* Ngày diễn ra */}
                <div className="col-md-6 mb-3">
                  <label className="form-label text-info">Ngày diễn ra</label>
                  <input type="date" className="form-control bg-dark text-white border-secondary" 
                    value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                </div>
              </div>

              <div className="row">
                {/* Giá vé */}
                <div className="col-md-6 mb-3">
                  <label className="form-label text-info">Giá vé (VNĐ)</label>
                  <input type="number" className="form-control bg-dark text-white border-secondary" 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                {/* Tổng số vé */}
                <div className="col-md-6 mb-3">
                  <label className="form-label text-info">Tổng số vé bán ra</label>
                  <input type="number" className="form-control bg-dark text-white border-secondary" 
                    value={formData.availableTickets} onChange={e => setFormData({...formData, availableTickets: e.target.value})} required />
                </div>
              </div>

              {/* Địa điểm */}
              <div className="mb-3">
                <label className="form-label text-info">Địa điểm tổ chức</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              </div>
            </div>

            <div className="col-md-4">
              {/* Vùng chọn ảnh Banner */}
              <div className="mb-3 text-center">
                <label className="form-label text-info d-block">Ảnh Banner Sự kiện</label>
                
                {/* Hiển thị ảnh xem trước */}
                <div className="border border-secondary border-2 rounded mb-3 d-flex align-items-center justify-content-center" 
                     style={{height: '220px', backgroundColor: '#1e1e1e', overflow: 'hidden'}}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    <span className="text-muted">Chưa có ảnh</span>
                  )}
                </div>

                <input type="file" className="form-control bg-dark text-white border-secondary" 
                  accept="image/*" onChange={handleFileChange} />
                <small className="text-muted d-block mt-2">Định dạng hỗ trợ: JPG, PNG, WEBP</small>
              </div>
            </div>
          </div>

          <hr className="border-secondary mt-4 mb-4" />

          <div className="d-flex gap-2 justify-content-center">
            <button type="submit" className="btn btn-warning px-5 fw-bold text-dark shadow">
              {id ? "💾 Cập Nhật Sự Kiện" : "🚀 Đăng Sự Kiện"}
            </button>
            <button type="button" className="btn btn-outline-light px-4" onClick={() => navigate('/admin')}>
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;