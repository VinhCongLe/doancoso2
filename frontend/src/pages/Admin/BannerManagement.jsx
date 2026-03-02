import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const fetchBanners = async () => {
    const res = await axios.get('http://localhost:5000/api/banners');
    setBanners(res.data.data);
  };
// eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchBanners(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', file);

    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/banners', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Thêm banner thành công!");
    fetchBanners();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa banner này?")) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/banners/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchBanners();
  };

  return (
    <div className="container mt-4 text-white">
      <h2 className="text-warning">🖼️ Quản Lý Banner</h2>
      
      <form onSubmit={handleSubmit} className="card bg-dark p-3 mb-4 border-secondary">
        <div className="row">
          <div className="col-md-5">
            <input type="text" className="form-control bg-dark text-white" placeholder="Tiêu đề banner" 
              onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="col-md-5">
            <input type="file" className="form-control bg-dark text-white" 
              onChange={e => setFile(e.target.files[0])} required />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">Thêm</button>
          </div>
        </div>
      </form>

      <div className="row">
        {banners.map(b => (
          <div className="col-md-4 mb-3" key={b._id}>
            <div className="card bg-dark border-secondary">
              <img src={`http://localhost:5000${b.image}`} className="card-img-top" style={{height: '150px', objectFit: 'cover'}} />
              <div className="card-body d-flex justify-content-between">
                <span>{b.title}</span>
                <button onClick={() => handleDelete(b._id)} className="btn btn-sm btn-danger">Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerManagement;