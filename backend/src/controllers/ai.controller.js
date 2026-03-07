const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require('../models/Event');
const Invoice = require('../models/Invoice');

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

// Chức năng Chatbot AI
exports.chat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: "Thiếu tin nhắn." });
    }

    try {
        // 1. Lấy dữ liệu từ MongoDB để làm Context
        const [events, invoices] = await Promise.all([
            Event.find().populate('categoryId', 'name').limit(20), // Lấy 20 sự kiện mới nhất
            Invoice.find().sort({ createdAt: -1 }).limit(10)      // Lấy 10 hóa đơn gần nhất để nắm tình hình bán vé
        ]);

        // 2. Tạo nội dung Context dữ liệu
        const eventContext = events.map(e => (
            `- ${e.title}: Tại ${e.location}, Giá ${e.price.toLocaleString('vi-VN')} VND, Còn ${e.availableTickets} vé. Bắt đầu: ${new Date(e.startDate).toLocaleDateString('vi-VN')}.`
        )).join('\n');

        const invoiceContext = invoices.map(i => (
            `- ${i.eventName}: Đã bán ${i.quantity} vé.`
        )).join('\n');

        // 3. Xây dựng Prompt cho Gemini
        const prompt = `
            Bạn là trợ lý AI thông minh của hệ thống đặt vé TicketPro. 
            Dưới đây là dữ liệu thực tế từ hệ thống:

            DANH SÁCH SỰ KIỆN:
            ${eventContext}

            TÌNH HÌNH BÁN VÉ GẦN ĐÂY:
            ${invoiceContext}

            YÊU CẦU:
            1. Sử dụng dữ liệu trên để trả lời câu hỏi của người dùng.
            2. Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp.
            3. Nếu không có thông tin trong dữ liệu, hãy xin lỗi và nói rằng bạn không nắm rõ.
            4. Luôn khuyến khích người dùng mua vé cho các sự kiện sắp diễn ra.

            CÂU HỎI CỦA NGƯỜI DÙNG:
            "${message}"
        `;

        // 4. Gọi Gemini API
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. Trả về response theo format mới
        res.status(200).json({
            answer: responseText
        });

    } catch (error) {
        console.error("Lỗi Gemini Chat CHI TIẾT:", {
            message: error.message,
            stack: error.stack,
            response: error.response ? await error.response.text() : 'No response body'
        });
        res.status(500).json({
            answer: `Rất tiếc, AI đang gặp sự cố: ${error.message}`
        });
    }
};

// Hàm cũ giữ lại placeholder để tránh lỗi import ở các file khác nếu chưa sửa kịp
exports.syncAllEvents = async (req, res) => {
    res.json({ message: "Chức năng Sync đã được thay thế bằng Logic Context trực tiếp của Gemini." });
};

// Giữ placeholder cho upsertEventEmbedding để không làm crash EventController
exports.upsertEventEmbedding = async () => {
    return true; // Không làm gì cả
};
