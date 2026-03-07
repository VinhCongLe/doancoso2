const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Event = require('./src/models/Event');

async function migrate() {
    await mongoose.connect('mongodb://127.0.0.1:27017/QuanLySuKienDB');

    // 1. Get unique categories currently in string format
    const events = await Event.find();
    console.log(`Analyzing ${events.length} events...`);

    const uniqueCatNames = [...new Set(events.map(e => e.toObject().category).filter(Boolean))];
    console.log("Unique legacy categories:", uniqueCatNames);

    // 2. Map them to Category documents
    const catMap = {};
    for (const name of uniqueCatNames) {
        let cat = await Category.findOne({ name });
        if (!cat) {
            cat = new Category({ name, description: `Hệ thống tự động tạo từ sự kiện: ${name}` });
            await cat.save();
        }
        catMap[name] = cat._id;
    }

    // 3. Update events
    for (const event of events) {
        const legacyName = event.toObject().category;
        if (legacyName && catMap[legacyName]) {
            event.categoryId = catMap[legacyName];
            // Clear legacy field if desired, though Mongoose already hides it from schema now
            event.set('category', undefined);
            await event.save();
        }
    }

    console.log("Migration complete.");
    await mongoose.disconnect();
}

migrate();
