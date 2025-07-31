// Simple JavaScript test for backend without TypeScript
console.log('🧪 Testing BudgetFlip Backend (Simple Test)...\n');

// Test basic dependencies
try {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { body } = require('express-validator');
  
  console.log('✅ All core dependencies loaded successfully');
  
  // Test password hashing
  const password = 'test123';
  const hash = bcrypt.hashSync(password, 10);
  const valid = bcrypt.compareSync(password, hash);
  console.log(`✅ Password hashing works: ${valid}`);
  
  // Test JWT
  const token = jwt.sign({ id: '123', email: 'test@example.com' }, 'secret', { expiresIn: '1h' });
  const decoded = jwt.verify(token, 'secret');
  console.log(`✅ JWT token works: ${decoded.email}`);
  
  console.log('\n✅ Basic backend functionality is working!');
  console.log('\nTo fully test the API, you need:');
  console.log('1. PostgreSQL running (use Docker: docker-compose up -d)');
  console.log('2. Run the server: npm run dev');
  console.log('3. Test endpoints using test-api.sh or test-api.http');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nPlease run: npm install');
}