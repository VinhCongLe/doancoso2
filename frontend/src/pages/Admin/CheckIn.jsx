import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import Swal from 'sweetalert2';

const CheckIn = () => {
    const [lastScan, setLastScan] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);
    const qrCodeRef = useRef(null);
    const scanTimeoutRef = useRef(null);

    // Camera configuration
    const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

    useEffect(() => {
        // Initialize the lower-level Html5Qrcode
        qrCodeRef.current = new Html5Qrcode("qr-reader");

        // Check for cameras on mount
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                setHasCamera(true);
            }
        }).catch(err => {
            console.error("No cameras found", err);
        });

        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        try {
            if (qrCodeRef.current) {
                setIsScanning(true);
                await qrCodeRef.current.start(
                    { facingMode: "environment" },
                    qrConfig,
                    (decodedText) => {
                        handleScanAction(decodedText);
                    },
                    (error) => {
                        // Scan failures are normal during seeking
                    }
                );
            }
        } catch (err) {
            console.error("Unable to start scanner", err);
            setIsScanning(false);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi Camera',
                text: 'Không thể khởi động camera. Vui lòng cấp quyền truy cập.',
                background: '#1a202c',
                color: '#fff'
            });
        }
    };

    const stopScanner = async () => {
        if (qrCodeRef.current && qrCodeRef.current.isScanning) {
            try {
                await qrCodeRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Unable to stop scanner", err);
            }
        }
    };

    const handleScanAction = async (scanText) => {
        // Prevent duplicate immediate scans
        if (scanText === lastScan) return;

        console.log("Processing Scan:", scanText);
        setLastScan(scanText);

        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => setLastScan(''), 3000);

        // Pause scanning effectively by checking lastScan
        // Or stop and restart if needed, but throttle is usually enough

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/payment/checkin',
                { ticketId: scanText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Success feedback
                await Swal.fire({
                    icon: 'success',
                    title: '✔ Check-in thành công',
                    html: `
                        <div style="text-align: left; margin-top: 10px; font-size: 0.95rem; color: #e2e8f0;">
                            <p><strong>Sự kiện:</strong> ${res.data.ticket.eventName}</p>
                            <p><strong>Số lượng:</strong> ${res.data.ticket.quantity} vé</p>
                            <p><strong>Tổng tiền:</strong> ${res.data.ticket.totalPrice.toLocaleString()}đ</p>
                        </div>
                    `,
                    timer: 3000,
                    showConfirmButton: false,
                    background: '#1a202c',
                    color: '#fff'
                });
            }
        } catch (error) {
            const message = error.response?.data?.message || "Lỗi không xác định";
            await Swal.fire({
                icon: 'error',
                title: '❌ Thất bại',
                text: message,
                timer: 3000,
                showConfirmButton: false,
                background: '#1a202c',
                color: '#fff'
            });
        }
    };

    return (
        <div className="checkin-container" style={{ padding: '1rem' }}>
            <div className="tp-page-header text-center mb-4">
                <h1 className="tp-page-title">Quét mã QR Check-in</h1>
                <p className="text-muted">Hệ thống soát vé tự động an toàn và nhanh chóng</p>
            </div>

            <div className="tp-card shadow-lg" style={{ maxWidth: '500px', margin: '0 auto', overflow: 'hidden', borderRadius: '16px', background: '#111827' }}>
                <div className="tp-card-body" style={{ padding: '0', position: 'relative' }}>
                    <div id="qr-reader" style={{ width: '100%', minHeight: '350px', background: '#000' }}></div>

                    {!isScanning && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.8)',
                            zIndex: 10
                        }}>
                            <button
                                className="btn-primary-tp"
                                style={{ padding: '12px 24px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold' }}
                                onClick={startScanner}
                            >
                                Mở Camera Quét Mã
                            </button>
                        </div>
                    )}

                    {isScanning && (
                        <button
                            onClick={stopScanner}
                            style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(239, 68, 68, 0.8)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                zIndex: 11,
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            🛑 Dừng Quét
                        </button>
                    )}
                </div>

                <div className="tp-card-body" style={{ textAlign: 'center', padding: '1.5rem', background: '#1f2937' }}>
                    {/* Manual Input Fallback */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                className="tp-input"
                                placeholder="Nhập mã vé thủ công (TICKET_...)"
                                id="manualTicketId"
                                style={{
                                    flex: 1,
                                    background: '#374151',
                                    border: '1px solid #4b5563',
                                    color: 'white',
                                    borderRadius: '8px',
                                    padding: '10px'
                                }}
                            />
                            <button
                                className="btn-primary-tp"
                                style={{ padding: '0 15px', borderRadius: '8px' }}
                                onClick={() => {
                                    const val = document.getElementById('manualTicketId').value;
                                    if (val) handleScanAction(val);
                                }}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>

                    {lastScan && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '10px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            borderRadius: '8px',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#a5b4fc',
                            fontSize: '0.85rem'
                        }}>
                            Mã vừa nhận: <strong style={{ color: 'white' }}>{lastScan}</strong>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                        <button
                            className="text-primary-tp"
                            style={{ background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.7 }}
                            onClick={() => handleScanAction('TICKET_TEST_123')}
                        >
                            Giả lập quét (Test)
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                #qr-reader video { 
                    width: 100% !important; 
                    height: 100% !important; 
                    object-fit: cover !important; 
                    border-radius: 16px 16px 0 0;
                }
                #qr-reader__scan_region {
                    background: transparent !important;
                }
                #qr-reader__scan_region svg {
                    stroke: #6366f1 !important;
                }
                `
            }} />
        </div>
    );
};

export default CheckIn;
