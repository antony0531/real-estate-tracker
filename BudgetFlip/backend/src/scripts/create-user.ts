import bcrypt from 'bcryptjs';
import { query } from '../config/database';

const createUser = async () => {
  try {
    const email = 'user@example.com';
    const password = 'password123';
    const name = 'John Doe';
    
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('User already exists with email:', email);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    
    console.log('✅ User created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Name:', name);
    console.log('ID:', result.rows[0].id);
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
};

createUser().then(() => process.exit());