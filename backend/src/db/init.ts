import { createTables, seedDemoData, dropTables, testConnection } from './migrations';

const args = process.argv.slice(2);
const command = args[0] || 'init';

async function main() {
  try {
    console.log('🚀 Database Management Tool\n');

    if (command === 'init') {
      console.log('Initializing database...');
      await testConnection();
      await createTables();
      console.log('\n✅ Database initialized successfully!');
      console.log('📝 Tables created: users, transactions, budgets, payments, bank_accounts, user_preferences, refresh_tokens\n');
    } else if (command === 'seed') {
      console.log('Seeding demo data...');
      await testConnection();
      await seedDemoData();
      console.log('\n✅ Demo data seeded successfully!\n');
    } else if (command === 'drop') {
      console.log('⚠️  Dropping all tables (development only)...');
      await testConnection();
      await dropTables();
      console.log('\n✅ All tables dropped!\n');
    } else if (command === 'reset') {
      console.log('🔄 Resetting database...');
      await testConnection();
      await dropTables();
      await createTables();
      await seedDemoData();
      console.log('\n✅ Database reset and seeded successfully!\n');
    } else if (command === 'test') {
      console.log('Testing database connection...');
      await testConnection();
      console.log('\n✅ Connection test passed!\n');
    } else {
      console.log('Available commands:');
      console.log('  npm run db:init   - Initialize database (create tables)');
      console.log('  npm run db:seed   - Seed demo data');
      console.log('  npm run db:drop   - Drop all tables (⚠️  development only)');
      console.log('  npm run db:reset  - Reset database (drop, create, seed)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
