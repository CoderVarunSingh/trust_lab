const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Lab = require('../models/Lab');
const Test = require('../models/Test');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Hospital = require('../models/Hospital');

const CITIES = ['Lucknow', 'Kanpur', 'Raebareli', 'Barabanki', 'Unnao'];

const LAB_PREFIXES = ['HealthFirst', 'MedTrust', 'CityPath', 'QuickDiag', 'PrimeCare', 'LifeLine', 'Pathkind', 'SRL', 'Thyrocare', 'Metropolis', 'Vijaya', 'Neuberg', 'iGenetic', 'Suburban', 'Max', 'Apollo', 'Trucare', 'SafeScan', 'LifeCare', 'Wellness'];
const LAB_SUFFIXES = ['Labs', 'Diagnostics', 'PathLabs', 'Healthcare', 'Scan Center', 'Care', 'Clinic'];

const AREAS = {
  'Lucknow': ['Hazratganj', 'Gomti Nagar', 'Alambagh', 'Indira Nagar', 'Aminabad', 'Aliganj', 'Mahanagar', 'Chowk'],
  'Kanpur': ['Swaroop Nagar', 'Kakadeo', 'Mall Road', 'Kidwai Nagar', 'Kalyanpur', 'Civil Lines'],
  'Raebareli': ['Civil Lines', 'Indira Nagar', 'Mahanagar', 'Rajendra Nagar'],
  'Barabanki': ['Nawabganj', 'Lakhpedabagh', 'Obri', 'Gaddipur'],
  'Unnao': ['Civil Lines', 'Avas Vikas', 'Singandarpura', 'Kalyani']
};

const TEST_CATALOG = [
  { testName: 'Complete Blood Count (CBC)', category: 'Hematology', basePrice: 300, reportTime: 6, popular: true },
  { testName: 'Lipid Profile', category: 'Biochemistry', basePrice: 500, reportTime: 12, popular: true },
  { testName: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', basePrice: 700, reportTime: 24, popular: true },
  { testName: 'HbA1c', category: 'Diabetes', basePrice: 450, reportTime: 12, popular: true },
  { testName: 'Liver Function Test (LFT)', category: 'Biochemistry', basePrice: 600, reportTime: 12 },
  { testName: 'Kidney Function Test (KFT)', category: 'Biochemistry', basePrice: 600, reportTime: 12 },
  { testName: 'Vitamin D', category: 'Vitamins', basePrice: 900, reportTime: 24, popular: true },
  { testName: 'Vitamin B12', category: 'Vitamins', basePrice: 750, reportTime: 24 },
  { testName: 'Fasting Blood Sugar (FBS)', category: 'Diabetes', basePrice: 100, reportTime: 4, popular: true },
  { testName: 'Post Prandial Blood Sugar (PPBS)', category: 'Diabetes', basePrice: 100, reportTime: 4 },
  { testName: 'Urine Routine & Microscopy', category: 'Pathology', basePrice: 150, reportTime: 6 },
  { testName: 'Serum Uric Acid', category: 'Biochemistry', basePrice: 200, reportTime: 8 },
  { testName: 'Electrolytes (Na, K, Cl)', category: 'Biochemistry', basePrice: 350, reportTime: 6 },
  { testName: 'CRP (C-Reactive Protein)', category: 'Immunology', basePrice: 450, reportTime: 8 },
  { testName: 'D-Dimer', category: 'Hematology', basePrice: 1200, reportTime: 12 },
  { testName: 'Ferritin', category: 'Hematology', basePrice: 600, reportTime: 12 },
  { testName: 'Prothrombin Time (PT/INR)', category: 'Hematology', basePrice: 300, reportTime: 6 },
  { testName: 'Widal Test', category: 'Serology', basePrice: 250, reportTime: 8 },
  { testName: 'Dengue NS1 Antigen', category: 'Serology', basePrice: 600, reportTime: 8 },
  { testName: 'Malaria Parasite Smear', category: 'Pathology', basePrice: 150, reportTime: 4 },
  { testName: 'Typhidot', category: 'Serology', basePrice: 400, reportTime: 8 },
  { testName: 'COVID-19 RT-PCR', category: 'Molecular', basePrice: 500, reportTime: 24 },
  { testName: 'Hepatitis B Surface Antigen (HBsAg)', category: 'Serology', basePrice: 350, reportTime: 8 },
  { testName: 'HIV 1 & 2 Antibodies', category: 'Serology', basePrice: 400, reportTime: 8 },
  { testName: 'VDRL (Syphilis)', category: 'Serology', basePrice: 200, reportTime: 6 },
  { testName: 'PSA (Prostate Specific Antigen)', category: 'Oncology', basePrice: 700, reportTime: 12 },
  { testName: 'CA-125', category: 'Oncology', basePrice: 900, reportTime: 24 },
  { testName: 'CEA', category: 'Oncology', basePrice: 800, reportTime: 24 },
  { testName: 'AFP (Alpha Fetoprotein)', category: 'Oncology', basePrice: 750, reportTime: 24 },
  { testName: 'Beta HCG', category: 'Hormones', basePrice: 600, reportTime: 12 },
  { testName: 'Prolactin', category: 'Hormones', basePrice: 500, reportTime: 12 },
  { testName: 'FSH (Follicle Stimulating Hormone)', category: 'Hormones', basePrice: 500, reportTime: 12 },
  { testName: 'LH (Luteinizing Hormone)', category: 'Hormones', basePrice: 500, reportTime: 12 },
  { testName: 'Testosterone', category: 'Hormones', basePrice: 650, reportTime: 12 },
  { testName: 'Cortisol', category: 'Hormones', basePrice: 700, reportTime: 24 },
  { testName: 'Iron Profile', category: 'Biochemistry', basePrice: 650, reportTime: 12 },
  { testName: 'Calcium', category: 'Biochemistry', basePrice: 200, reportTime: 6 },
  { testName: 'Phosphorus', category: 'Biochemistry', basePrice: 250, reportTime: 6 },
  { testName: 'Amylase', category: 'Biochemistry', basePrice: 400, reportTime: 8 },
  { testName: 'Lipase', category: 'Biochemistry', basePrice: 500, reportTime: 8 },
  { testName: 'Full Body Health Checkup', category: 'Packages', basePrice: 2500, reportTime: 36, popular: true },
  { testName: 'Diabetic Profile Mini', category: 'Packages', basePrice: 800, reportTime: 12 }
];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async (skipConnect = false) => {
  try {
    if (!skipConnect) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB for seeding...');
    }

    await User.deleteMany({});
    await Lab.deleteMany({});
    await Test.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Hospital.deleteMany({});
    console.log('Cleared existing data.');

    const hashedPw = await bcrypt.hash('password123', 10);

    // 1. Generate Basic Users
    const basicUsers = [
      { name: 'Rahul Sharma', email: 'patient@demo.com', password: hashedPw, loginMode: 'password', role: 'patient', phone: '9876543210', city: 'Lucknow' },
      { name: 'Priya Patel', email: 'patient2@demo.com', password: hashedPw, loginMode: 'password', role: 'patient', phone: '9876543211', city: 'Kanpur' },
      { name: 'Dr. Anjali Mehta', email: 'doctor@demo.com', password: hashedPw, loginMode: 'password', role: 'doctor', phone: '9876543213', city: 'Lucknow' },
      { name: 'Apollo Hospital', email: 'hospital@demo.com', password: hashedPw, loginMode: 'password', role: 'hospital', phone: '9876543220', city: 'Lucknow' },
    ];

    // 2. Generate 50 Lab Users
    const labUsersData = [];
    for (let i = 1; i <= 50; i++) {
      labUsersData.push({
        name: `Lab Admin ${i}`,
        email: `lab${i}@demo.com`,
        password: hashedPw,
        loginMode: 'password',
        role: 'lab',
        phone: `9876543${String(i).padStart(3, '0')}`,
        city: getRandomElement(CITIES)
      });
    }

    const allUsers = await User.insertMany([...basicUsers, ...labUsersData]);
    console.log(`✅ Created ${allUsers.length} users`);

    const patient1 = allUsers.find(u => u.email === 'patient@demo.com');
    const doctor1 = allUsers.find(u => u.email === 'doctor@demo.com');
    const hospUser1 = allUsers.find(u => u.email === 'hospital@demo.com');
    const createdLabUsers = allUsers.filter(u => u.role === 'lab');

    // 3. Generate 50 Labs using the 50 Lab Users
    const labsData = [];
    for (let i = 0; i < 50; i++) {
      const city = createdLabUsers[i].city;
      const areaList = AREAS[city] || ['Main Road'];
      const area = getRandomElement(areaList);
      const prefix = getRandomElement(LAB_PREFIXES);
      const suffix = getRandomElement(LAB_SUFFIXES);
      
      labsData.push({
        name: `${prefix} ${suffix} ${i+1}`,
        description: 'Quality diagnostics and trusted results.',
        location: {
          city: city,
          area: area,
          address: `Shop ${getRandomInt(1,100)}, ${area}, ${city}`,
        },
        trustScore: getRandomInt(40, 95),
        ratings: (getRandomInt(30, 50) / 10),
        totalReviews: getRandomInt(10, 500),
        reportConsistency: (getRandomInt(35, 50) / 10),
        accreditedBy: Math.random() > 0.5 ? ['NABL'] : [],
        homeCollection: Math.random() > 0.3,
        operatingHours: '8:00 AM - 8:00 PM',
        phone: createdLabUsers[i].phone,
        email: createdLabUsers[i].email,
        doctorRecommendations: getRandomInt(0, 50),
        userId: createdLabUsers[i]._id,
      });
    }

    const insertedLabs = await Lab.insertMany(labsData);
    console.log(`✅ Created ${insertedLabs.length} labs across ${CITIES.length} cities`);

    // 4. Generate Tests for Each Lab
    const allTestsData = [];
    insertedLabs.forEach(lab => {
      // Each lab gets a random subset of tests (between 15 and 30 tests)
      const numTests = getRandomInt(15, 30);
      const shuffledCatalog = [...TEST_CATALOG].sort(() => 0.5 - Math.random());
      const selectedTests = shuffledCatalog.slice(0, numTests);

      selectedTests.forEach(test => {
        // Price variation +/- 20%
        const priceVariation = getRandomInt(-20, 20);
        const actualPrice = Math.floor(test.basePrice * (1 + priceVariation/100));
        
        allTestsData.push({
          testName: test.testName,
          category: test.category,
          price: actualPrice,
          labId: lab._id,
          reportTime: test.reportTime + getRandomInt(-4, 4),
          popular: test.popular || false
        });
      });
    });

    const insertedTests = await Test.insertMany(allTestsData);
    console.log(`✅ Created ${insertedTests.length} total test records (~${Math.floor(insertedTests.length / 50)} per lab)`);

    // 5. Some Reviews
    await Review.insertMany([
      { userId: patient1._id, labId: insertedLabs[0]._id, rating: 5, accuracyScore: 5, comment: 'Excellent' }
    ]);

    // 6. Hospital
    await Hospital.insertMany([
      { name: 'Apollo Hospital', address: 'Main Road', city: 'Lucknow', phone: '011', doctors: [doctor1._id], recommendedLabs: [insertedLabs[0]._id], userId: hospUser1._id }
    ]);

    console.log('\n🎉 Scaling Seed Completed successfully!');
    console.log('─────────────────────────────────');
    console.log(`Total Config: 5 Cities, ${insertedLabs.length} Labs, 42 Unique Tests (${insertedTests.length} combinations)`);
    console.log('Demo Accounts: patient@demo.com, doctor@demo.com, lab1@demo.com, lab50@demo.com');
    console.log('─────────────────────────────────\n');

    if (!skipConnect) process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    if (!skipConnect) process.exit(1);
    throw error;
  }
};

module.exports = async () => { await seedDB(true); };
if (require.main === module) { seedDB(); }
