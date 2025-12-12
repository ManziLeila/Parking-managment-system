const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigration() {
    try {
        console.log('🔄 Running database migrations...');

        const migrationsDir = './database/migrations';
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Run in alphabetical order

        for (const file of files) {
            console.log(`  Running: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await pool.query(sql);
            console.log(`  ✅ ${file} completed`);
        }

        console.log('✅ All database migrations completed successfully!');
        console.log('📊 Tables: users, parking_lots, reservations, payments');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
