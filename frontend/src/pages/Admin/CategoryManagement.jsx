import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: '', name: '', description: '' });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditMode(true);
            setCurrentCategory({ id: category._id, name: category.name, description: category.description || '' });
        } else {
            setEditMode(false);
            setCurrentCategory({ id: '', name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editMode) {
                await axios.put(`http://localhost:5000/api/categories/${currentCategory.id}`,
                    { name: currentCategory.name, description: currentCategory.description },
                    config
                );
                Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã cập nhật loại sự kiện!', timer: 1500, showConfirmButton: false });
            } else {
                await axios.post('http://localhost:5000/api/categories',
                    { name: currentCategory.name, description: currentCategory.description },
                    config
                );
                Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã thêm loại sự kiện mới!', timer: 1500, showConfirmButton: false });
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: error.response?.data?.message || 'Đã có lỗi xảy ra!' });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: "Dữ liệu loại sự kiện này sẽ bị xóa vĩnh viễn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Đúng, xóa nó!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Đã xóa!', 'Loại sự kiện đã được gỡ bỏ.', 'success');
                fetchCategories();
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                Swal.fire('Lỗi!', 'Không thể xóa loại sự kiện này.', 'error');
            }
        }
    };

    return (
        <div className="category-mgmt">
            <div className="tp-page-header">
                <h1 className="tp-page-title">Quản Lý Loại Sự Kiện</h1>
                <button className="btn-primary-tp" onClick={() => handleOpenModal()}>
                    + Thêm loại sự kiện
                </button>
            </div>

            <div className="tp-table-wrap">
                <table className="tp-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>STT</th>
                            <th>Tên loại</th>
                            <th>Mô tả</th>
                            <th style={{ textAlign: 'center', width: '200px' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Đang tải...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>Chưa có loại sự kiện nào.</td></tr>
                        ) : (
                            categories.map((cat, index) => (
                                <tr key={cat._id}>
                                    <td>{index + 1}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{cat.description || 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button className="btn-success-tp" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => handleOpenModal(cat)}>
                                                ✏️ Sửa
                                            </button>
                                            <button className="btn-danger-tp" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => handleDelete(cat._id)}>
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal - Pure CSS/JS implementation since we are avoiding extra libs */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="tp-card" style={{ width: '90%', maxWidth: '500px' }}>
                        <div className="tp-card-body">
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                                {editMode ? 'Chỉnh sửa loại sự kiện' : 'Thêm loại sự kiện mới'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="tp-form-group">
                                    <label className="tp-label">Tên loại sự kiện *</label>
                                    <input
                                        type="text"
                                        className="tp-input"
                                        required
                                        value={currentCategory.name}
                                        onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    />
                                </div>
                                <div className="tp-form-group">
                                    <label className="tp-label">Mô tả</label>
                                    <textarea
                                        className="tp-input"
                                        rows="3"
                                        value={currentCategory.description}
                                        onChange={e => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button type="button" className="btn-ghost-tp" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary-tp">Lưu lại</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
