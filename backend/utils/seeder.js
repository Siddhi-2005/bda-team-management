const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Lead = require('../models/Lead');

// Load env vars if run directly
if (require.main === module) {
  dotenv.config({ path: `${__dirname}/../.env` });
}

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bda_team_management';
    
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('Database connected for seeding...');
    }

    // Clear all existing data
    await User.deleteMany();
    await Team.deleteMany();
    await Task.deleteMany();
    await Lead.deleteMany();
    console.log('🧹 Cleaned existing database collections');

    // 1. Create Users
    const usersData = [
      { name: 'Admin User', email: 'admin@bda.com', password: 'password123', role: 'admin', phone: '+919988776655', department: 'Executive Management' },
      { name: 'Priya Sharma', email: 'priya@bda.com', password: 'password123', role: 'manager', phone: '+919876543210', department: 'Enterprise Sales' },
      { name: 'Rahul Verma', email: 'rahul@bda.com', password: 'password123', role: 'manager', phone: '+918765432109', department: 'SME Sales' },
      { name: 'Ankit Patel', email: 'ankit@bda.com', password: 'password123', role: 'bda', phone: '+917654321098', department: 'Enterprise Sales' },
      { name: 'Sneha Reddy', email: 'sneha@bda.com', password: 'password123', role: 'bda', phone: '+916543210987', department: 'Enterprise Sales' },
      { name: 'Vikram Singh', email: 'vikram@bda.com', password: 'password123', role: 'bda', phone: '+915432109876', department: 'SME Sales' },
      { name: 'Meera Joshi', email: 'meera@bda.com', password: 'password123', role: 'bda', phone: '+914321098765', department: 'SME Sales' },
      { name: 'Arjun Das', email: 'arjun@bda.com', password: 'password123', role: 'bda', phone: '+913210987654', department: 'SME Sales' }
    ];

    const users = [];
    for (const u of usersData) {
      const user = await User.create(u);
      users.push(user);
    }
    console.log(`👤 Created ${users.length} Users`);

    const admin = users[0];
    const manager1 = users[1];
    const manager2 = users[2];
    const bda1 = users[3];
    const bda2 = users[4];
    const bda3 = users[5];
    const bda4 = users[6];
    const bda5 = users[7];

    // 2. Create Teams
    const teamsData = [
      {
        name: 'Enterprise Growth Team',
        description: 'Focuses on securing enterprise-level partnerships and high-value contracts.',
        manager: manager1._id,
        members: [bda1._id, bda2._id],
        target: 5000000,
        achieved: 3200000,
        region: 'North'
      },
      {
        name: 'Mid-Market SME Team',
        description: 'Handles SME client acquisitions and local business partnerships.',
        manager: manager2._id,
        members: [bda3._id, bda4._id, bda5._id],
        target: 3000000,
        achieved: 2100000,
        region: 'West'
      }
    ];

    const teams = [];
    for (const t of teamsData) {
      const team = await Team.create(t);
      teams.push(team);
    }
    console.log(`👥 Created ${teams.length} Teams`);

    const team1 = teams[0];
    const team2 = teams[1];

    // Update users with their respective teams
    await User.findByIdAndUpdate(manager1._id, { team: team1._id });
    await User.findByIdAndUpdate(bda1._id, { team: team1._id });
    await User.findByIdAndUpdate(bda2._id, { team: team1._id });

    await User.findByIdAndUpdate(manager2._id, { team: team2._id });
    await User.findByIdAndUpdate(bda3._id, { team: team2._id });
    await User.findByIdAndUpdate(bda4._id, { team: team2._id });
    await User.findByIdAndUpdate(bda5._id, { team: team2._id });

    // 3. Create Tasks
    const tasksData = [
      { title: 'Prepare Enterprise pitch deck', description: 'Create a tailored pitch deck for potential Fortune 500 companies.', status: 'inprogress', priority: 'high', assignedTo: bda1._id, assignedBy: manager1._id, team: team1._id, dueDate: new Date(Date.now() + 3*24*60*60*1000), tags: ['sales', 'presentation'] },
      { title: 'Follow up with Google Lead', description: 'Schedule a discovery call regarding cloud integrations.', status: 'todo', priority: 'critical', assignedTo: bda1._id, assignedBy: manager1._id, team: team1._id, dueDate: new Date(Date.now() + 1*24*60*60*1000), tags: ['google', 'follow-up'] },
      { title: 'Conduct market research in Bangalore', description: 'Collect B2B contact lists and segment prospects in Bangalore Tech Park.', status: 'done', priority: 'medium', assignedTo: bda2._id, assignedBy: manager1._id, team: team1._id, dueDate: new Date(Date.now() - 2*24*60*60*1000), completedAt: new Date(Date.now() - 2*24*60*60*1000), tags: ['research', 'bangalore'] },
      { title: 'Send proposal to Acme Corp', description: 'Finalize pricing model and send out SaaS licensing agreement.', status: 'review', priority: 'high', assignedTo: bda2._id, assignedBy: manager1._id, team: team1._id, dueDate: new Date(Date.now() + 2*24*60*60*1000), tags: ['proposal', 'acme'] },
      
      { title: 'Cold call local retail merchants', description: 'Target 50 retail shops in South Mumbai to Pitch Point-of-Sale integrations.', status: 'inprogress', priority: 'medium', assignedTo: bda3._id, assignedBy: manager2._id, team: team2._id, dueDate: new Date(Date.now() + 5*24*60*60*1000), tags: ['cold-call', 'mumbai'] },
      { title: 'Resolve billing queries for Apex Retail', description: 'Clarify commission model details for onboarding merchant.', status: 'done', priority: 'high', assignedTo: bda4._id, assignedBy: manager2._id, team: team2._id, dueDate: new Date(Date.now() - 1*24*60*60*1000), completedAt: new Date(Date.now() - 1*24*60*60*1000), tags: ['billing', 'support'] },
      { title: 'Arrange demo with Zomato Partner team', description: 'Pitch local discount campaign strategy.', status: 'todo', priority: 'low', assignedTo: bda5._id, assignedBy: manager2._id, team: team2._id, dueDate: new Date(Date.now() + 7*24*60*60*1000), tags: ['demo', 'zomato'] },
      { title: 'Review weekly BDA progress reports', description: 'Review SME teams activity logs and conversion rates.', status: 'inprogress', priority: 'high', assignedTo: manager2._id, assignedBy: admin._id, team: team2._id, dueDate: new Date(Date.now() + 1*24*60*60*1000), tags: ['reporting'] }
    ];

    await Task.insertMany(tasksData);
    console.log(`📋 Created ${tasksData.length} Tasks`);

    // 4. Create Leads
    const leadsData = [
      { name: 'Google Cloud Platform', email: 'procurement@google.com', phone: '+1234567890', company: 'Google Inc.', status: 'negotiation', source: 'referral', value: 1500000, assignedTo: bda1._id, team: team1._id, notes: 'Interested in bulk server security licenses.', followUpDate: new Date(Date.now() + 2*24*60*60*1000) },
      { name: 'Microsoft Enterprise', email: 'sales@microsoft.com', phone: '+1234567891', company: 'Microsoft', status: 'proposal', source: 'website', value: 2000000, assignedTo: bda1._id, team: team1._id, notes: 'Sent draft SLA last Thursday.', followUpDate: new Date(Date.now() + 4*24*60*60*1000) },
      { name: 'Tata Consultancy Services', email: 'partner@tcs.com', phone: '+919123456780', company: 'TCS Ltd.', status: 'won', source: 'social_media', value: 1200000, assignedTo: bda2._id, team: team1._id, notes: 'Deal closed! Training scheduled for next month.', closedDate: new Date(Date.now() - 5*24*60*60*1000) },
      { name: 'Infosys BPO', email: 'info@infosys.com', phone: '+919123456781', company: 'Infosys', status: 'won', source: 'event', value: 2000000, assignedTo: bda2._id, team: team1._id, notes: 'Contract signed. First invoice cleared.', closedDate: new Date(Date.now() - 15*24*60*60*1000) },
      { name: 'Wipro Digital', email: 'bpo@wipro.com', phone: '+919123456782', company: 'Wipro', status: 'new', source: 'cold_call', value: 800000, assignedTo: bda1._id, team: team1._id, notes: 'Identified decision maker, sending intro email.' },
      
      { name: 'Decathlon Sports India', email: 'retail@decathlon.in', phone: '+919223456780', company: 'Decathlon India', status: 'qualified', source: 'event', value: 600000, assignedTo: bda3._id, team: team2._id, notes: 'Met at Retail Tech Summit. Highly interested in POS system.', followUpDate: new Date(Date.now() + 3*24*60*60*1000) },
      { name: 'Burger King Franchise', email: 'franchise@burgerking.in', phone: '+919223456781', company: 'BK India', status: 'won', source: 'referral', value: 900000, assignedTo: bda3._id, team: team2._id, notes: 'Onboarded 12 outlets across Pune.', closedDate: new Date(Date.now() - 3*24*60*60*1000) },
      { name: 'Relish Bakery & Foods', email: 'relish@gmail.com', phone: '+919223456782', company: 'Relish Group', status: 'proposal', source: 'website', value: 300000, assignedTo: bda4._id, team: team2._id, notes: 'Sent customized SME package proposal.', followUpDate: new Date(Date.now() + 5*24*60*60*1000) },
      { name: 'Crossword Bookstore', email: 'proc@crossword.in', phone: '+919223456783', company: 'Crossword Ltd', status: 'won', source: 'cold_call', value: 700000, assignedTo: bda4._id, team: team2._id, notes: 'Yearly maintenance contract signed.', closedDate: new Date(Date.now() - 10*24*60*60*1000) },
      { name: 'Smart Retail Mart', email: 'ops@smartretail.com', phone: '+919223456784', company: 'Smart Retail', status: 'lost', source: 'other', value: 500000, assignedTo: bda5._id, team: team2._id, notes: 'Lost to competitor due to pricing difference.', closedDate: new Date(Date.now() - 2*24*60*60*1000) },
      { name: 'Chai Point Local Partner', email: 'store@chaipoint.com', phone: '+919223456785', company: 'Chai Point', status: 'contacted', source: 'social_media', value: 200000, assignedTo: bda5._id, team: team2._id, notes: 'Left message for store manager.', followUpDate: new Date(Date.now() + 1*24*60*60*1000) },
      { name: 'FabIndia Handlooms', email: 'b2b@fabindia.com', phone: '+919223456786', company: 'FabIndia', status: 'won', source: 'referral', value: 500000, assignedTo: bda5._id, team: team2._id, notes: 'Closed trial license contract.', closedDate: new Date(Date.now() - 22*24*60*60*1000) }
    ];

    await Lead.insertMany(leadsData);
    console.log(`📈 Created ${leadsData.length} Leads`);

    console.log('✅ Database successfully seeded with sample BDA system data!');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`❌ Seeder Error: ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

// Run directly if called via CLI
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
