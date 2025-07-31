import { query } from '../config/database';

const seedProjects = async () => {
  try {
    console.log('🌱 Seeding projects...');

    // Get the first user to assign as owner
    const userResult = await query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.error('No users found. Please create a user first.');
      return;
    }
    const userId = userResult.rows[0].id;

    // Project data
    const projects = [
      {
        name: 'Brooklyn Brownstone Flip',
        address: '456 Park Slope Ave, Brooklyn, NY 11215',
        budget: 450000,
        start_date: '2024-01-15',
        target_end_date: '2024-07-15',
        status: 'completed',
        priority: 'high',
        description: 'Full renovation of a 3-story brownstone in Park Slope. New kitchen, bathrooms, and restored original hardwood floors.',
        total_spent: 425000
      },
      {
        name: 'Queens Single Family Renovation',
        address: '789 Forest Hills Rd, Queens, NY 11375',
        budget: 320000,
        start_date: '2024-03-01',
        target_end_date: '2024-09-01',
        status: 'in_progress',
        priority: 'medium',
        description: '4BR/2BA single family home. Kitchen remodel, new HVAC, updated electrical, and landscaping.',
        total_spent: 185000
      },
      {
        name: 'Manhattan Studio Conversion',
        address: '321 Upper East Side, New York, NY 10021',
        budget: 280000,
        start_date: '2024-05-01',
        target_end_date: '2024-08-15',
        status: 'in_progress',
        priority: 'high',
        description: 'Converting a large 1BR into 2 studio apartments. Complete gut renovation with luxury finishes.',
        total_spent: 125000
      },
      {
        name: 'Bronx Multi-Family Investment',
        address: '654 Grand Concourse, Bronx, NY 10451',
        budget: 550000,
        start_date: '2024-06-15',
        target_end_date: '2025-01-15',
        status: 'planning',
        priority: 'medium',
        description: '3-unit multi-family property. Planning phase for complete renovation of all units plus common areas.',
        total_spent: 15000
      },
      {
        name: 'Staten Island Colonial Restore',
        address: '987 Victory Blvd, Staten Island, NY 10301',
        budget: 380000,
        start_date: '2024-04-10',
        target_end_date: '2024-10-10',
        status: 'in_progress',
        priority: 'low',
        description: 'Historical colonial home restoration. Preserving original features while modernizing systems.',
        total_spent: 145000
      },
      {
        name: 'Long Island Beach House Flip',
        address: '123 Ocean Ave, Long Beach, NY 11561',
        budget: 425000,
        start_date: '2024-07-01',
        target_end_date: '2025-01-01',
        status: 'planning',
        priority: 'high',
        description: 'Beach house renovation focusing on coastal design. New deck, windows, and complete interior remodel.',
        total_spent: 0
      },
      {
        name: 'Jersey City Condo Upgrade',
        address: '555 Newport Pkwy, Jersey City, NJ 07310',
        budget: 180000,
        start_date: '2023-11-01',
        target_end_date: '2024-03-01',
        status: 'completed',
        priority: 'medium',
        description: '2BR/2BA luxury condo renovation. High-end kitchen, spa bathrooms, and smart home integration.',
        total_spent: 175000
      },
      {
        name: 'Hoboken Townhouse Project',
        address: '222 Washington St, Hoboken, NJ 07030',
        budget: 520000,
        start_date: '2024-08-01',
        target_end_date: '2025-02-01',
        status: 'planning',
        priority: 'high',
        description: '4-story townhouse in prime location. Planning full gut renovation with roof deck addition.',
        total_spent: 0
      }
    ];

    // Insert projects
    for (const project of projects) {
      const projectNumberResult = await query(`SELECT nextval('project_number_seq') as project_number`);
      const projectNumber = projectNumberResult.rows[0].project_number;
      
      const currentYear = new Date(project.start_date).getFullYear();
      const displayId = `BF-${currentYear}-${String(projectNumber).padStart(4, '0')}`;

      await query(
        `INSERT INTO projects (
          name, address, budget, start_date, target_end_date, 
          status, priority, description, created_by, project_number, display_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          project.name,
          project.address,
          project.budget,
          project.start_date,
          project.target_end_date,
          project.status,
          project.priority,
          project.description,
          userId,
          projectNumber,
          displayId
        ]
      );

      console.log(`✅ Created project: ${project.name} (${displayId})`);

      // If project has spent amount, add some sample expenses
      if (project.total_spent > 0) {
        const projectResult = await query('SELECT id FROM projects WHERE display_id = $1', [displayId]);
        const projectId = projectResult.rows[0].id;

        // Add sample expenses
        const expenseCategories = [
          { name: 'Materials', percentage: 0.4 },
          { name: 'Labor', percentage: 0.35 },
          { name: 'Permits', percentage: 0.05 },
          { name: 'Equipment', percentage: 0.1 },
          { name: 'Other', percentage: 0.1 }
        ];

        for (const category of expenseCategories) {
          const amount = Math.floor(project.total_spent * category.percentage);
          if (amount > 0) {
            await query(
              `INSERT INTO expenses (project_id, amount, vendor, description, expense_date, status, created_by)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                projectId,
                amount,
                `${category.name} Vendor Co.`,
                `${category.name} for ${project.name}`,
                project.start_date,
                'approved',
                userId
              ]
            );
          }
        }
        console.log(`  💰 Added expenses totaling $${project.total_spent.toLocaleString()}`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
  }
};

// Run the seeder
seedProjects().then(() => process.exit());