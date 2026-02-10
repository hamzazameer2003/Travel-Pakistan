const mongoose = require('mongoose');
const Tour = require('./models/Tour');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelpakistan');

const tours = [
  {
    title: 'Himalayan Trek',
    destination: 'Kaghan Valley',
    description: 'Experience the breathtaking beauty of Pakistan\'s Himalayas with this guided trek.',
    price: 1500,
    duration: '7 Days',
    availableSeats: 20,
    numDays: 7,
    startDate: new Date('2025-12-20'),
    images: ['https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=300'],
    category: 'Adventure',
    organizer: 'Mac Miller Adventures',
  },
  {
    title: 'Cultural Heritage Tour',
    destination: 'Lahore',
    description: 'Explore the rich Mughal history and architectural marvels of Lahore.',
    price: 800,
    duration: '3 Days',
    availableSeats: 15,
    numDays: 3,
    startDate: new Date('2025-12-15'),
    images: ['https://images.unsplash.com/photo-1609741197334-b65dbed5e5b7?w=400&h=300'],
    category: 'Cultural',
    organizer: 'Heritage Explorers',
  },
  {
    title: 'Coastal Escape',
    destination: 'Karachi',
    description: 'Relax on the sandy beaches and enjoy seafood in Pakistan\'s largest city.',
    price: 600,
    duration: '5 Days',
    availableSeats: 25,
    numDays: 5,
    startDate: new Date('2025-12-10'),
    images: ['https://images.unsplash.com/photo-1500242268344-f81918ea7fcf?w=400&h=300'],
    category: 'Beach',
    organizer: 'Coastal Journeys',
  },
  {
    title: 'Northern Lights Chase',
    destination: 'Swat Valley',
    description: 'A magical trip to witness the stunning landscapes of Swat.',
    price: 1200,
    duration: '4 Days',
    availableSeats: 18,
    numDays: 4,
    startDate: new Date('2025-12-05'),
    images: ['https://images.unsplash.com/photo-1579686067458-4ca33ca6f7e3?w=400&h=300'],
    category: 'Adventure',
    organizer: 'Mountains & Beyond',
  },
  {
    title: 'Desert Safari',
    destination: 'Cholistan',
    description: 'Ride camels and explore the vast Cholistan Desert.',
    price: 700,
    duration: '2 Days',
    availableSeats: 12,
    numDays: 2,
    startDate: new Date('2025-12-25'),
    images: ['https://images.unsplash.com/photo-1510633911112-e5c4be1dadc6?w=400&h=300'],
    category: 'Adventure',
    organizer: 'Desert Expeditions',
  },
];

const seedDB = async () => {
  await Tour.deleteMany({});
  await Tour.insertMany(tours);
  console.log('Tours seeded');
  mongoose.connection.close();
};

seedDB().catch(console.error);
