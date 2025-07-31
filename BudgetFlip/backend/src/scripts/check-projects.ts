import { query } from '../config/database';

const checkProjects = async () => {
  try {
    // Get the user we just created
    const userResult = await query("SELECT id, email FROM users WHERE email = 'user@example.com'");
    if (userResult.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log('Current user:', userResult.rows[0]);
    
    // Check all projects
    const allProjectsResult = await query('SELECT id, name, created_by, display_id FROM projects');
    console.log('\nTotal projects in database:', allProjectsResult.rows.length);
    
    // Check projects for our user
    const userProjectsResult = await query(
      'SELECT id, name, status, budget, display_id FROM projects WHERE created_by = $1',
      [userId]
    );
    console.log('\nProjects owned by user@example.com:', userProjectsResult.rows.length);
    
    // If no projects for this user, update existing projects to assign to this user
    if (userProjectsResult.rows.length === 0 && allProjectsResult.rows.length > 0) {
      console.log('\nUpdating projects to assign to user@example.com...');
      await query('UPDATE projects SET created_by = $1', [userId]);
      
      // Check again
      const updatedProjectsResult = await query(
        'SELECT id, name, status, budget, display_id FROM projects WHERE created_by = $1',
        [userId]
      );
      console.log('Projects now owned by user@example.com:', updatedProjectsResult.rows.length);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

checkProjects().then(() => process.exit());