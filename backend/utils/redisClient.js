const { createClient } = require('redis');

const client = createClient({
    socket: {
        host: 'localhost', 
        port: 6379,
        reconnectStrategy: (retries) => {
            if (retries > 5) { // TĂNG SỐ LẦN THỬ
                console.log('❌ Redis disconnected after 5 retries');
                return false;
            }
            return 2000; // THỬ LẠI SAU 2 GIÂY
        }
    }
});

// THÊM SỰ KIỆN KẾT NỐI
client.on('connect', () => console.log('🟢 Redis connecting...'));
client.on('ready', () => console.log('✅ Redis ready'));
client.on('error', (err) => console.log('🔴 Redis error:', err.message));
client.on('end', () => console.log('🛑 Redis disconnected'));

(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Redis connection failed:', err);
        process.exit(1); // THOÁT ỨNG DỤNG NẾU KHÔNG KẾT NỐI ĐƯỢC
    }
})();

module.exports = client;