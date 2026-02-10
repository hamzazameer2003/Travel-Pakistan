const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
// Ollama API configuration
const OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
let ollamaReady = false;

async function initializeOllama() {
  try {
    console.log('🔍 AI: Checking Ollama connection...');

    // Test Ollama connection by listing available models via HTTP API
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const models = response.data?.models || [];

    if (models.length === 0) {
      console.log('⚠️  WARNING: No models found in Ollama');
      console.log('🔧 AI: Please install phi3 model: ollama pull phi3');
      console.log('💡 AI: phi3 is lightweight and perfect for lower-end systems');
      return false;
    }

    // Check if phi3 model is available
    const hasPhi3 = models.some(model => model.name.includes('phi3'));

    if (!hasPhi3) {
      console.log('⚠️  WARNING: phi3 model not found in Ollama');
      console.log('🔧 AI: Please install phi3: ollama pull phi3');
      console.log('💡 AI: phi3 is lightweight (2.3GB) and fast');
      return false;
    }

    console.log('✅ AI: Ollama connection successful');
    console.log(`📊 AI: Found ${models.length} installed models:`);
    models.forEach(model => console.log(`   • ${model.name}`));

    ollamaReady = true;
    return true;
  } catch (error) {
    console.error('❌ AI: Failed to connect to Ollama:', error.message);
    console.log('🔧 AI: Troubleshooting:');
    console.log('   1. Install Ollama: https://ollama.ai/download');
    console.log('   2. Start Ollama: ollama serve (in another terminal)');
    console.log('   3. Pull phi3 model: ollama pull phi3');
    console.log('   4. Restart this backend');
    return false;
  }
}

// Test Ollama connection with phi3 model via HTTP API
async function checkOllama() {
  console.log('🚀 AI: Testing Ollama connection with phi3 model...');

  if (!ollamaReady) {
    console.log('❌ AI: Ollama not ready');
    console.log('🔧 AI: Please ensure Ollama is running and has phi3 model installed');
    console.log('💡 AI: Run: ollama serve (in another terminal)');
    console.log('💡 AI: Install phi3: ollama pull phi3');
    return false;
  }

  try {
    // Test Ollama specifically with phi3 model via HTTP API
    console.log('🔍 AI: Testing Ollama with phi3 model via HTTP API');

    const testResponse = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'phi3',
      prompt: 'Hello',
      stream: false,
      options: {
        num_predict: 10, // Short response for testing
      }
    }, { timeout: 10000 });

    if (testResponse.data?.response) {
      console.log('✅ AI: Ollama connection successful!');
      console.log('🤖 AI: Virtual Tour Guide ready with LOCAL AI!');
      console.log('🎯 AI: Using lightweight Ollama model: phi3');
      console.log('🇵🇰 AI: Pakistan Virtual Tour Guide is fully operational!');
      console.log('🚀 AI: You can now chat with the AI guide at /ai-tour-guide');
      return true;
    } else {
      throw new Error('Empty response from phi3 model');
    }

  } catch (error) {
    console.error('❌ AI: Ollama connection failed');
    console.error('🔍 AI: Error details:', error.response?.data || error.message);

    if (error.message.includes('connect ECONNREFUSED') || error.code === 'ECONNREFUSED') {
      console.error('🔧 DIAGNOSIS: Ollama server not running');
      console.error('💡 RECOMMENDATION: Start Ollama with: ollama serve');
    } else if (error.response?.data?.error?.includes('model not found')) {
      console.error('🔧 DIAGNOSIS: phi3 model not available');
      console.error('💡 RECOMMENDATION: Pull phi3 model: ollama pull phi3');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔧 DIAGNOSIS: Ollama not installed or network issue');
      console.error('💡 RECOMMENDATION: Install Ollama from https://ollama.ai/download');
    }

    console.log('📚 AI: Quick setup for phi3:');
    console.log('   1. Download & install Ollama from https://ollama.ai/download');
    console.log('   2. Start Ollama: ollama serve (keep this running)');
    console.log('   3. Pull phi3 model: ollama pull phi3 (only 2.3GB!)');
    console.log('   4. Restart this backend');

    return false;
  }
}

// Email configuration - SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.log('⚠️  WARNING: SENDGRID_API_KEY not found in environment variables');
  console.log('💡 Email functionality will be disabled');
} else {
  console.log('✅ SendGrid API key loaded (first 10 chars):', process.env.SENDGRID_API_KEY.substring(0, 10));
}

const Tour = require('./models/Tour');
const User = require('./models/User');
const PrivateTour = require('./models/PrivateTour');
const ContactMessage = require('./models/ContactMessage');
const Message = require('./models/Message');
const Payment = require('./models/Payment');
const OrganizerPaymentDetails = require('./models/OrganizerPaymentDetails');
const OTP = require('./models/OTP');
const Review = require('./models/Review');
const Booking = require('./models/Booking');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handlers for real-time messaging
const connectedUsers = new Map(); // Map to store user ID -> socket ID

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Authenticate user when they connect
  socket.on('authenticate', (data) => {
    const { token, username } = data;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = username;
      socket.authenticated = true;
      connectedUsers.set(username, socket.id);
      console.log(`✅ User authenticated: ${username}`);

      // Mark messages as delivered when user connects
      markMessagesDelivered(username).catch(err => console.error('Delivery update error:', err));
    } catch (err) {
      console.error('❌ Socket authentication failed:', err.message);
      socket.disconnect();
    }
  });

  // Handle user joining a chat room for organizer conversations
  socket.on('join_chat', (organizer) => {
    if (!socket.authenticated) return;
    socket.join(`chat_${organizer}`);
    console.log(`📖 User ${socket.userId} joined chat with ${organizer}`);
  });

  // Handle reading messages in a chat
  socket.on('mark_read', async (data) => {
    if (!socket.authenticated) return;

    const { withUser } = data;
    try {
      // Mark messages from 'withUser' to current user as read
      await Message.updateMany(
        {
          from: withUser,
          to: socket.userId,
          readAt: null
        },
        { readAt: new Date() }
      );

      // Notify the sender that messages were read
      const senderSocket = connectedUsers.get(withUser);
      if (senderSocket) {
        io.to(senderSocket).emit('messages_read', {
          by: socket.userId,
          at: new Date()
        });
      }

      console.log(`👁️ Messages marked as read for ${socket.userId} from ${withUser}`);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`🚪 User disconnected: ${socket.userId}`);
    }
  });
});

// Function to mark messages as delivered for a connected user
async function markMessagesDelivered(recipient) {
  try {
    const result = await Message.updateMany(
      {
        to: recipient,
        deliveredAt: null
      },
      { deliveredAt: new Date() }
    );

    if (result.modifiedCount > 0) {
      console.log(`📬 Marked ${result.modifiedCount} messages as delivered for ${recipient}`);
    }
  } catch (err) {
    console.error('Mark delivered error:', err);
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection (replace with your MongoDB URI)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelpakistan').then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Basic route
app.get('/', (req, res) => {
  res.send('Travel Pakistan Backend');
});

// Tour routes
app.get('/api/tours', async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, category } = req.query;
    let query = {};

    if (destination) {
      query.destination = destination;
    }
    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }
    if (category) {
      query.category = category;
    }

    const tours = await Tour.find(query);
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suggest tours endpoint
app.get('/api/suggest', async (req, res) => {
  try {
    const { destination, budget, days } = req.query;
    let query = {};

    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }
    if (budget) {
      query.price = { $lte: Number(budget) };
    }
    if (days) {
      query.duration = { $regex: new RegExp(`^${days}`, 'i') };
    }

    const tours = await Tour.find(query);
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tours', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Organizer') {
      return res.status(403).json({ error: 'Only organizers can create tours' });
    }
    const { title, destination, description, price, duration, availableSeats, numDays, startDate, category, images } = req.body;
    const tour = new Tour({
      title,
      destination,
      description,
      price,
      duration,
      availableSeats,
      numDays,
      startDate,
      category,
      images,
      organizer: user.username,
    });
    await tour.save();
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get organizer's tours
app.get('/api/organizer-tours', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Organizer') {
      return res.status(403).json({ error: 'Only organizers can access their tours' });
    }

    const tours = await Tour.find({ organizer: user.username }).sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update tour
app.put('/api/tours/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Organizer') {
      return res.status(403).json({ error: 'Only organizers can update tours' });
    }

    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check if the tour belongs to the organizer
    if (tour.organizer !== user.username) {
      return res.status(403).json({ error: 'You can only update your own tours' });
    }

    const { title, destination, description, price, duration, availableSeats, numDays, startDate, category, images } = req.body;

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      {
        title,
        destination,
        description,
        price,
        duration,
        availableSeats,
        numDays,
        startDate,
        category,
        images,
      },
      { new: true }
    );

    res.json(updatedTour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete tour
app.delete('/api/tours/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Organizer') {
      return res.status(403).json({ error: 'Only organizers can delete tours' });
    }

    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check if the tour belongs to the organizer
    if (tour.organizer !== user.username) {
      return res.status(403).json({ error: 'You can only delete your own tours' });
    }

    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth routes
app.post('/api/send-signup-otp', async (req, res) => {
  try {
    const { username, email, phone, role, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await OTP.findOneAndDelete({ email });
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send email using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: {
            email: process.env.FROM_EMAIL || 'noreply@travelpakistan.com',
            name: 'Travel Pakistan'
          },
          subject: 'Email Verification - Travel Pakistan',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <div style="background-color: #01411c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Travel Pakistan</h1>
                <p style="margin: 5px 0 0 0; font-size: 16px;">Discover the Land of Adventure</p>
              </div>
              <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #01411c; margin-bottom: 20px;">Email Verification</h2>
                <p>Hello,</p>
                <p>Your verification code for Travel Pakistan account registration is:</p>
                <div style="background-color: #f4f9f4; border: 2px solid #01411c; border-radius: 4px; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #01411c;">
                  ${otp}
                </div>
                <p><strong>Please enter this code within 5 minutes.</strong></p>
                <p>If you don't want this verification, please ignore this email.</p>
                <p style="margin-top: 30px;">Best regards,<br>Travel Pakistan Team</p>
              </div>
            </div>
          `,
          text: `Your verification code is: ${otp}. This code will expire in 5 minutes.`
        });
        console.log(`✅ OTP email sent to ${email} via SendGrid`);
      } catch (emailError) {
        console.error('❌ SendGrid email sending failed:', emailError.message);
        console.log('⚠️  Continuing without email verification');
      }
    } else {
      console.log('📧 Email functionality DISABLED (No SENDGRID_API_KEY configured)');
      console.log(`📧 Mock OTP for ${email}: ${otp}`);
    }

    res.json({ message: 'OTP sent to your email!', tempData: { username, email, phone, role, password } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-signup-otp', async (req, res) => {
  try {
    const { username, email, phone, role, password, otp } = req.body;

    // Check if user exists (again)
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Verify OTP
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Delete OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    // Create user
    user = new User({ username, email, phone, role, password });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    // Remove expiresIn for persistent sessions until manual logout
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    let user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    // Remove expiresIn for persistent sessions until manual logout
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Private Tour routes (protected)
app.get('/api/private-tours', auth, async (req, res) => {
  try {
    const privateTours = await PrivateTour.find({ user: req.user.id }).populate('user', 'username email');
    res.json(privateTours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/private-tours', auth, async (req, res) => {
  try {
    const { destination, numPeople, budget, days, requirements } = req.body;
    const privateTour = new PrivateTour({
      destination,
      numPeople,
      budget,
      days,
      requirements,
      user: req.user.id,
    });
    await privateTour.save();
    res.json(privateTour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all private tours (for organizers)
app.get('/api/private-tours/all', auth, async (req, res) => {
  try {
    const privateTours = await PrivateTour.find().populate('user', 'username email');
    res.json(privateTours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact message route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contactMessage = new ContactMessage({
      name,
      email,
      message,
    });
    await contactMessage.save();
    res.json({ success: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Message routes (protected)
app.get('/api/chats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get all messages for this user
    const messages = await Message.find({
      $or: [{ from: user.username }, { to: user.username }]
    }).sort({ createdAt: -1 });

    // Group by the other user (organizer) and accumulate info
    const chats = {};
    messages.forEach(msg => {
      const otherUser = msg.from === user.username ? msg.to : msg.from;
      if (!chats[otherUser]) {
        chats[otherUser] = {
          organizer: otherUser,
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          unread: 0,
        };
      }

      // Update last message info if this is more recent
      if (msg.createdAt > chats[otherUser].lastTime) {
        chats[otherUser].lastMessage = msg.content;
        chats[otherUser].lastTime = msg.createdAt;
      }

      // Count unread messages (messages from the other user that haven't been read)
      if (msg.from === otherUser && !msg.readAt) {
        chats[otherUser].unread += 1;
      }
    });

    res.json(Object.values(chats));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages/:organizer', auth, async (req, res) => {
  try {
    const organizer = req.params.organizer;
    const user = await User.findById(req.user.id);
    const messages = await Message.find({
      $or: [
        { from: user.username, to: organizer },
        { from: organizer, to: user.username }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages/:organizer', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const organizer = req.params.organizer;
    const user = await User.findById(req.user.id);

    // Generate unique message ID
    const messageId = `${user.username}_${organizer}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const message = new Message({
      from: user.username,
      to: organizer,
      content,
      messageId,
    });
    await message.save();

    // Send real-time message to recipient if online
    const recipientSocket = connectedUsers.get(organizer);
    if (recipientSocket) {
      // Mark message as delivered immediately since recipient is online
      message.deliveredAt = new Date();

      // Save the delivered status
      await Message.findByIdAndUpdate(message._id, { deliveredAt: new Date() });

      io.to(recipientSocket).emit('new_message', {
        ...message.toObject(),
        deliveredAt: new Date()
      });
      console.log(`📤 Message delivered to ${organizer} via socket`);
    } else {
      console.log(`📨 Message stored for ${organizer} (offline)`);
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment routes
app.post('/api/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, tourId } = req.body;
    // Amount in cents for Stripe
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'pkr',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment-success', auth, async (req, res) => {
  try {
    const { paymentIntentId, tourId, paymentMethod, seats = 1 } = req.body;
    const user = await User.findById(req.user.id);
    const tour = await Tour.findById(tourId);

    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check if enough seats are available
    const selectedSeats = parseInt(seats) || 1;
    if (tour.availableSeats < selectedSeats) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    const totalAmount = tour.price * selectedSeats;

    // Create booking record
    const booking = new Booking({
      tourist: user._id,
      touristName: user.username,
      touristEmail: user.email,
      touristPhone: user.phone,
      tour: tour._id,
      tourTitle: tour.title,
      tourPrice: tour.price,
      organizer: tour.organizer,
      organizerId: await User.findOne({ username: tour.organizer }).select('_id'),
      seatsBooked: selectedSeats,
      totalAmount: totalAmount,
      paymentIntentId: paymentIntentId,
      paymentStatus: 'completed',
      paymentMethod: paymentMethod,
      status: 'confirmed',
      tourDate: tour.startDate
    });

    await booking.save();

    // Reduce available seats in tour
    await Tour.findByIdAndUpdate(tourId, {
      $inc: { availableSeats: -selectedSeats }
    });

    // Create payment record (for backward compatibility)
    const payment = new Payment({
      tourist: user._id,
      organizer: tour.organizer,
      tour: tour._id,
      amount: totalAmount,
      paymentMethod: paymentMethod,
      status: 'completed',
      transactionId: paymentIntentId,
    });

    await payment.save();

    console.log(`✅ Booking created for ${user.username}: ${selectedSeats} seats, Rs${totalAmount}`);
    console.log(`📊 Tour ${tour.title}: ${tour.availableSeats - selectedSeats} seats remaining`);

    res.json({
      message: 'Payment and booking successful!',
      booking,
      payment,
      remainingSeats: tour.availableSeats - selectedSeats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/organizer-payment-details', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Organizer') {
      return res.status(403).json({ error: 'Only organizers can access payment details' });
    }

    const paymentDetails = await OrganizerPaymentDetails.findOne({ organizer: user._id });
    res.json(paymentDetails || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/organizer-payment-details', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Organizer') {
      return res.status(403).json({ error: 'Only organizers can set payment details' });
    }

    const { paymentType, accountDetails } = req.body;

    // Delete existing
    await OrganizerPaymentDetails.deleteMany({ organizer: user._id });

    const paymentDetails = new OrganizerPaymentDetails({
      organizer: user._id,
      paymentType,
      accountDetails,
    });

    await paymentDetails.save();
    res.json({ message: 'Payment details saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Review and Rating routes
app.get('/api/reviews/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour: tourId, isPublic: true })
      .populate('tourist', 'username')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', auth, async (req, res) => {
  try {
    const { tourId, reviewText, organizerRating } = req.body;
    const tourist = await User.findById(req.user.id);

    if (!tourist || tourist.role !== 'Tourist') {
      return res.status(403).json({ error: 'Only tourists can leave reviews' });
    }

    // Check if tourist has already reviewed this tour
    const existingReview = await Review.findOne({
      tour: tourId,
      tourist: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this tour' });
    }

    // Get tour and organizer info
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Create the review
    const review = new Review({
      tour: tourId,
      tourist: req.user.id,
      touristName: tourist.username,
      reviewText: reviewText.trim(),
      organizerRating,
      organizer: tour.organizer,
      reviewType: 'tour_review'
    });

    await review.save();

    // Update organizer's rating
    await updateOrganizerRating(tour.organizer);

  res.status(201).json({
    success: true,
    review,
    message: 'Review submitted successfully!'
  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Booking routes
app.get('/api/bookings/tourist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Tourist') {
      return res.status(403).json({ error: 'Only tourists can view their bookings' });
    }

    const bookings = await Booking.find({ tourist: req.user.id, status: 'confirmed' })
      .populate('tour', 'title destination images startDate organizer')
      .populate('organizerId', 'username phone rating totalReviews')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/organizer', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Organizer') {
      return res.status(403).json({ error: 'Only organizers can view bookings' });
    }

    const bookings = await Booking.find({ organizer: user.username, status: 'confirmed' })
      .populate('tour', 'title destination startDate availableSeats')
      .populate('tourist', 'username email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Helper function to update organizer's average rating
async function updateOrganizerRating(organizerUsername) {
  try {
    const reviews = await Review.find({
      organizer: organizerUsername,
      isPublic: true
    });

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.organizerRating, 0);
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    await User.findOneAndUpdate(
      { username: organizerUsername },
      {
        rating: parseFloat(averageRating),
        totalReviews: totalReviews
      }
    );

    console.log(`Updated ${organizerUsername}: ${totalReviews} reviews, rating: ${averageRating}`);
  } catch (error) {
    console.error('Error updating organizer rating:', error);
  }
}

// Home page endpoints
app.get('/api/top-tours', async (req, res) => {
  try {
    // Get all tours with organizer info
    const tours = await Tour.find().populate('organizer');

    // Calculate review statistics for each tour
    const toursWithStats = await Promise.all(
      tours.map(async (tour) => {
        const reviews = await Review.find({ tour: tour._id, isPublic: true });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.organizerRating, 0) / totalReviews
          : 0;

        // Get latest review for display
        const latestReview = reviews.length > 0
          ? await Review.findOne({ tour: tour._id, isPublic: true })
              .populate('tourist', 'username')
              .sort({ createdAt: -1 })
          : null;

        // Calculate ranking score: prioritize review count, then rating
        const rankingScore = (totalReviews * 10) + averageRating;

        return {
          ...tour.toObject(),
          reviewStats: {
            totalReviews,
            averageRating: parseFloat(averageRating.toFixed(1)),
            rankingScore
          },
          latestReview: latestReview ? {
            reviewText: latestReview.reviewText,
            rating: latestReview.organizerRating,
            touristName: latestReview.touristName,
            createdAt: latestReview.createdAt
          } : null
        };
      })
    );

    // Sort by ranking score (review count + rating), then by creation date
    toursWithStats.sort((a, b) => {
      // Primary sort: by ranking score (higher is better)
      if (a.reviewStats.rankingScore !== b.reviewStats.rankingScore) {
        return b.reviewStats.rankingScore - a.reviewStats.rankingScore;
      }
      // Secondary sort: by creation date (newer first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Return only top 3 tours
    const top3Tours = toursWithStats.slice(0, 3);

    console.log(`📊 Top 3 tours calculated: ${top3Tours.map(t => `${t.title} (${t.reviewStats.totalReviews} reviews, ${t.reviewStats.averageRating}★)`).join(', ')}`);

    res.json(top3Tours);
  } catch (err) {
    console.error('Error fetching top tours:', err);
    res.status(500).json({ error: err.message });
  }
});

// Organizer profile endpoint
app.get('/api/organizers/:username/profile', async (req, res) => {
  try {
    const { username } = req.params;

    // Get organizer info
    const organizer = await User.findOne({ username, role: 'Organizer' });
    if (!organizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }

    // Get organizer's tours
    const tours = await Tour.find({ organizer: username })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get latest review for this organizer
    const latestReview = await Review.findOne({ organizer: username, isPublic: true })
      .populate('tourist', 'username')
      .populate('tour', 'title destination')
      .sort({ createdAt: -1 });

    res.json({
      organizer: {
        username: organizer.username,
        email: organizer.email,
        phone: organizer.phone,
        rating: organizer.rating,
        totalReviews: organizer.totalReviews
      },
      tours,
      latestReview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/top-organizers', async (req, res) => {
  try {
    const organizers = await User.find({
      role: 'Organizer',
      rating: { $gt: 0 }
    })
      .sort({ rating: -1, totalReviews: -1 })
      .limit(6);

    // Calculate score (rating * review count)
    organizers.forEach(org => {
      org.score = org.rating * org.totalReviews;
    });

    // Sort by score
    organizers.sort((a, b) => b.score - a.score);

    res.json(organizers.slice(0, 6));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Virtual Tour Guide endpoint - Ollama (Local AI Service)
app.post('/api/ai-tour-guide', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare the system prompt for Pakistan tourism expertise
    const systemPrompt = `You are an AI Virtual Tour Guide for Travel Pakistan, a tourism platform dedicated to showcasing Pakistan's incredible beauty and cultural heritage.

You are an expert tour guide with extensive knowledge about:
• Pakistan's diverse destinations (Northern areas, Kashmir, Lahore, Karachi, Islamabad)
• Local cultures, traditions, customs, and social etiquette
• Pakistani cuisine and food culture
• Historical sites, Mughal architecture, ancient ruins
• Adventure activities, trekking routes, outdoor experiences
• Accommodation options and travel logistics
• Visa requirements and travel documentation
• Budget planning and seasonal recommendations
• Local festivals, events, and celebrations
• Language assistance and cultural tips
• Safety and travel advice
• Transportation options within Pakistan

Your personality is:
• Warm, welcoming, enthusiastic about Pakistan
• Knowledgeable and professional
• Helpful and patient with tourists
• Culturally sensitive and respectful
• Concise but informative in responses
• Inspires travelers while providing practical information

Guidelines:
1. Focus specifically on Pakistan tourism and culture
2. Provide practical, current travel information
3. Use appropriate cultural context and local insights
4. Encourage safe and responsible travel
5. Include specific recommendations when possible
6. Keep responses helpful and actionable
7. Use conversational, friendly tone with travelers

Make travelers excited about discovering Pakistan's wonders while ensuring they have all needed information for successful, enjoyable trips.`;

    // Check if Ollama is ready
    if (!ollamaReady) {
      console.error('❌ AI: Ollama not ready');
      const fallbackResponse = getFallbackResponse(message);
      return res.json({
        success: true,
        response: fallbackResponse,
        fallback: true,
        error: 'AI service not ready'
      });
    }

    try {
      // Use only phi3 model for lightweight processing
      const modelName = 'phi3';
      console.log(`🤖 AI: Using lightweight Ollama model ${modelName} for user query`);

      // Generate response using Ollama HTTP API with phi3
      const ollamaResponse = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
        model: modelName,
        prompt: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 400, // Shorter responses for faster processing
        }
      }, { timeout: 60000 }); // 60 second timeout for AI response

      const responseText = ollamaResponse.data?.response?.trim() ||
        'I apologize, but I am unable to provide a complete response at the moment.';

      res.json({
        success: true,
        response: responseText,
        model: modelName,
        ai: true
      });

    } catch (ollamaError) {
      console.error('🚨 Ollama API Error Details:');
      console.error('  Message:', ollamaError.message);

      // Specific diagnostic messages for Ollama
      if (ollamaError.message.includes('connection refused') || ollamaError.message.includes('ECONNREFUSED')) {
        console.error('🔧 DIAGNOSIS: Ollama server not running');
        console.error('💡 RECOMMENDATION: Start Ollama with: ollama serve');
      } else if (ollamaError.message.includes('model not found')) {
        console.error('🔧 DIAGNOSIS: Model not available');
        console.error('💡 RECOMMENDATION: Pull a model: ollama pull llama3.2');
      } else if (ollamaError.code === 'ENOTFOUND') {
        console.error('🔧 DIAGNOSIS: Ollama not installed');
        console.error('💡 RECOMMENDATION: Install Ollama from https://ollama.ai/download');
      }

      // If Ollama not available, use fallback responses
      const fallbackResponse = getFallbackResponse(message);
      res.json({
        success: true,
        response: fallbackResponse,
        fallback: true,
        error: ollamaError.message
      });
    }

  } catch (error) {
    console.error('AI Tour Guide Server Error:', error);

    const fallbackResponse = getFallbackResponse(req.body.message);
    res.status(500).json({
      success: false,
      error: 'AI service temporarily unavailable',
      response: fallbackResponse,
      fallback: true
    });
  }
});

// Fallback responses in case AI fails
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('kashmir')) {
    return "🗻 Kashmir, often called Paradise on Earth, offers breathtaking landscapes with crystal-clear lakes, snow-capped mountains, and lush valleys. Key attractions include Dal Lake, Gulmarg Ski Resort, Pahalgam Valley, and Srinagar's Mughal Gardens. Best visited in summer (June-August) for valley beauty or winter (December-February) for skiing. Local transportation is available, and houseboat stays on Dal Lake are highly recommended.";
  }

  if (msg.includes('food') || msg.includes('eat')) {
    return "🍽️ Pakistani cuisine is rich and diverse! Try these signature dishes: Biryani (fragrant rice dish), Karahi (spicy meat curry), Nihari (slow-cooked stew), and street foods like Samosa and Pakora. Lahore has excellent food streets, while Karachi offers international cuisine alongside local favorites. Halal-certified restaurants are everywhere, and the hospitality of Pakistani food culture is legendary!";
  }

  if (msg.includes('safety')) {
    return "🛡️ Pakistan is generally safe for tourists, with millions visiting annually. While Pakistan faced challenges, tourism areas are well-protected. Popular destinations have security measures. Always follow local guidelines, respect customs, and consider guided tours for peace of mind. The Pakistan Tourism Development Corporation ensures tourist safety across the country.";
  }

  if (msg.includes('lahore')) {
    return "🏰 Lahore, Pakistan's cultural capital, boasts Mughal architecture from Shah Jahan's era. Must-visit: Badshahi Masjid (world's largest mosque), Lahore Fort, Shalimar Gardens, and Anarkali Bazaar. Punjab's food scene is amazing here! Visit during winter (October-February) for pleasant weather and festivals. Stay in Gulberg or DHA areas for comfort.";
  }

  return "🇵🇰 Welcome to Pakistan! I apologize that the AI service is currently unavailable, but I'm here to help with any questions about Pakistan tourism. What would you like to know about your journey to this beautiful country? Whether it's destinations, food, culture, visas, or practical travel advice, I can provide information about Pakistan's incredible wonders.";
}

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('🇵🇰 Travel Pakistan Backend - Powered by Ollama Local AI + Real-Time Chat');

  // Initialize Ollama and check status
  const isInitialized = await initializeOllama();
  if (isInitialized) {
    await checkOllama();
  } else {
    console.log('⚠️ AI: Ollama not ready - AI features will use fallback responses');
    console.log('💡 AI: Start Ollama server and pull models to enable AI chat');
  }
});
