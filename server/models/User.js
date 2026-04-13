const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  pin: { type: String, default: '' }, // 4-digit PIN (hashed)
  loginMode: { type: String, enum: ['password', 'pin', 'email'], default: 'password' },
  role: { type: String, enum: ['patient', 'doctor', 'lab', 'hospital'], default: 'patient' },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  avatar: { type: String, default: '' },
  
  // Optional Patient Profile Fields
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  bloodGroup: { type: String, default: '' },
  address: { type: String, default: '' },
  medicalHistory: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('pin') && this.pin) {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchPin = async function (enteredPin) {
  if (!this.pin) return false;
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
