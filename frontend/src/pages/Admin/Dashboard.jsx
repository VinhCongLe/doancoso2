import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/tickets/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const stats = res.data.data;
        setData(stats);
        
        // Tính tổng nhanh để hiện các ô con số
        const revenue = stats.reduce((sum, item) => sum + item.totalRevenue, 0);
        const orders = stats.reduce((sum, item) => sum + item.totalTickets, 0);
        setSummary({ totalRevenue: revenue, totalOrders: orders });
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mt-4 text-white mb-5">
      <h2 className="text-warning mb-4">📊 Thống Kê Doanh Thu</h2>

      {/* Các thẻ con số tổng quan */}
      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card bg-success text-white shadow-sm p-3">
            <h5>💰 Tổng Doanh Thu (Đã thanh toán)</h5>
            <h2 className="fw-bold">{summary.totalRevenue.toLocaleString()} VNĐ</h2>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-primary text-white shadow-sm p-3">
            <h5>🎟️ Tổng Số Vé Đã Bán</h5>
            <h2 className="fw-bold">{summary.totalOrders} Vé</h2>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Biểu đồ Cột */}
        <div className="col-md-6 mb-4">
          <div className="card bg-dark border-secondary p-3 shadow">
            <h5 className="text-info mb-4">Doanh thu theo ngày</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="_id" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                  <Bar dataKey="totalRevenue" fill="#ffc107" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Biểu đồ Đường */}
        <div className="col-md-6 mb-4">
          <div className="card bg-dark border-secondary p-3 shadow">
            <h5 className="text-info mb-4">Số lượng vé bán ra</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="_id" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="totalTickets" stroke="#0d6efd" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;