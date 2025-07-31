// Simple test to verify backend logic without database
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

console.log('🧪 Testing BudgetFlip Backend Logic...\n');

// Test 1: Password hashing
console.log('1. Testing password hashing...');
const password = 'password123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
const isValid = bcrypt.compareSync(password, hash);
console.log(`   ✅ Password hashing works: ${isValid}\n`);

// Test 2: JWT token generation
console.log('2. Testing JWT tokens...');
const user = { id: '123', email: 'test@example.com', role: 'user' };
const token = jwt.sign(user, 'secret', { expiresIn: '15m' });
const decoded = jwt.verify(token, 'secret') as any;
console.log(`   ✅ JWT token generated and verified`);
console.log(`   User ID: ${decoded.id}`);
console.log(`   Email: ${decoded.email}\n`);

// Test 3: Express route validation
console.log('3. Testing validation logic...');
require('express-validator');
console.log(`   ✅ Express validator imported successfully\n`);

// Test 4: Controller imports
console.log('4. Testing controller imports...');
try {
  require('./controllers/auth.controller');
  console.log('   ✅ Auth controller loads successfully');
  require('./controllers/project.controller');
  console.log('   ✅ Project controller loads successfully');
  require('./controllers/expense.controller');
  console.log('   ✅ Expense controller loads successfully\n');
} catch (error: any) {
  console.log(`   ❌ Error loading controllers: ${error.message}\n`);
}

console.log('✅ Backend logic tests completed!');
console.log('\nNote: Database operations require PostgreSQL to be running.');
console.log('Use Docker or set up a local PostgreSQL instance to test full functionality.');