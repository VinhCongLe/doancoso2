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

        // Tính tổng từ dữ liệu trả về (mảng các ngày)
        const revenue = stats.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        const orders = stats.reduce((sum, item) => sum + (item.totalTickets || 0), 0);
        setSummary({ totalRevenue: revenue, totalOrders: orders });
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="tp-page-header">
        <h1 className="tp-page-title">Thống Kê Doanh Thu</h1>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="tp-stat-card">
            <div className="tp-stat-icon tp-stat-icon-green">💰</div>
            <div>
              <div className="tp-stat-label">Tổng Doanh Thu (Đã thanh toán)</div>
              <div className="tp-stat-value" style={{ fontSize: '1.3rem' }}>
                {summary.totalRevenue.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--success)' }}>VNĐ</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="tp-stat-card">
            <div className="tp-stat-icon tp-stat-icon-indigo">🎟️</div>
            <div>
              <div className="tp-stat-label">Tổng Số Vé Đã Bán</div>
              <div className="tp-stat-value">
                {summary.totalOrders} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-light)' }}>Vé</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4">
        {/* Bar Chart */}
        <div className="col-md-6">
          <div className="tp-chart-card">
            <div className="tp-chart-title">📊 Doanh thu theo ngày</div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="_id" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="totalRevenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="col-md-6">
          <div className="tp-chart-card">
            <div className="tp-chart-title">📈 Số lượng vé bán ra</div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="_id" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalTickets"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: 'var(--accent)', strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                  />
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