import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let connectPromise = null;
let listenersAttached = false;

const databaseNameFromUri = (uri) => {
    try {
        const asHttp = uri
            .replace(/^mongodb\+srv:\/\//, 'https://')
            .replace(/^mongodb:\/\//, 'https://');
        const name = new URL(asHttp).pathname.replace(/^\//, '').split('/')[0];
        return decodeURIComponent(name || '');
    }
    catch {
        return '';
    }
};

const attachListeners = () => {
    if (listenersAttached)
        return;
    listenersAttached = true;
    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB disconnected. The driver will reconnect automatically.');
    });
    mongoose.connection.on('reconnected', () => {
        const name = mongoose.connection.name || 'unknown';
        console.log(`✅ MongoDB reconnected (${name})`);
    });
    mongoose.connection.on('error', (error) => {
        console.error('MongoDB error:', error?.message || error);
    });
};

const connectWithRetry = (attempt = 1) => {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }
    if (connectPromise) {
        return connectPromise;
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return Promise.reject(new Error('MONGODB_URI is not defined'));
    }
    const delayMs = Math.min(30000, 2000 * attempt);
    console.log('Connecting to MongoDB...');
    connectPromise = mongoose.connect(uri, {
        family: 4,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
    }).then(() => {
        const name = mongoose.connection.name || databaseNameFromUri(uri) || 'unknown';
        console.log('✅ Connected to MongoDB');
        console.log(`MongoDB Database: ${name}`);
        return mongoose.connection;
    }).catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log(`Retrying MongoDB in ${delayMs / 1000}s (attempt ${attempt})...`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                connectPromise = null;
                connectWithRetry(attempt + 1).then(resolve, reject);
            }, delayMs);
        });
    });
    return connectPromise;
};

const connectDB = async () => {
    attachListeners();
    await connectWithRetry();
};

export default connectDB;
