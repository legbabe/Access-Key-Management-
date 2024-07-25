const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { expect } = require('@jest/globals');
const app = require('../app'); 
const User = require('../backend/models/user_model');
const transport = require('nodemailer'); 
const { signup_post, login_post, verify_token, reset_post, password_post } = require('../backend/controllers/auth_controller');

jest.mock('../backend/models/user_model');
jest.mock('nodemailer');
jest.mock('bcrypt');

describe('User Authentication and Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should register a new user and send verification email', async () => {
      const email = 'test@example.com';
      const password = 'Password123';
      const hashedPassword = 'hashedPassword123';
      const user = { _id: '12345', email, password: hashedPassword };
      const token = 'token123';
      
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.insertMany.mockResolvedValue([user]);
      jwt.sign.mockReturnValue(token);
      transport.sendMail.mockImplementation((options, callback) => callback(null, true));

      const res = await request(app)
        .post('/signup')
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(User.insertMany).toHaveBeenCalledWith({ email, password: hashedPassword });
      expect(transport.sendMail).toHaveBeenCalledWith(expect.anything(), expect.anything());
    });

    it('should handle errors during signup', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const error = new Error('Signup error');
      error.code = 11000;
      User.insertMany.mockRejectedValue(error);

      const res = await request(app)
        .post('/signup')
        .send({ email, password });

      expect(res.status).toBe(400);
      expect(res.body.errors.email).toBe('Email is already in use..');
    });
  });

  describe('POST /login', () => {
    it('should login an existing user and set cookies', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { _id: '12345', email, role: 'user' };
      const token = 'token123';

      User.login.mockResolvedValue(user);
      jwt.sign.mockReturnValue(token);

      const res = await request(app)
        .post('/login')
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(User.login).toHaveBeenCalledWith(email, password);
      expect(res.body.user).toBe(user.role);
    });

    it('should handle login errors', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const error = new Error('Login error');
      error.message = 'Incorrect email';
      User.login.mockRejectedValue(error);

      const res = await request(app)
        .post('/login')
        .send({ email, password });

      expect(res.status).toBe(400);
      expect(res.body.errors.email).toBe('That email is not registered');
    });
  });

  describe('POST /reset', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';
      const user = { _id: '12345', email };
      const token = 'token123';

      User.findOne.mockResolvedValue(user);
      jwt.sign.mockReturnValue(token);
      transport.sendMail.mockImplementation((options, callback) => callback(null, true));

      const res = await request(app)
        .post('/reset')
        .send({ email });

      expect(res.status).toBe(200);
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(transport.sendMail).toHaveBeenCalledWith(expect.anything(), expect.anything());
    });

    it('should handle password reset errors', async () => {
      const email = 'test@example.com';
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/reset')
        .send({ email });

      expect(res.status).toBe(200);
      expect(res.text).toContain('No user exist with this email!');
    });
  });

  describe('POST /password', () => {
    it('should reset the password for a user', async () => {
      const token = 'token123';
      const password = 'newpassword123';
      const user = {
        _id: '12345',
        email: 'test@example.com',
        passwordResetToken: token,
        passwordResetExpires: Date.now() + 3600000,
      };
      const hashedPassword = 'hashedPassword123';

      jwt.verify.mockReturnValue({ userId: user._id });
      User.findOne.mockResolvedValue(user);
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const res = await request(app)
        .post('/password')
        .send({ token, password });

      expect(res.status).toBe(200);
      expect(User.findOne).toHaveBeenCalledWith({
        _id: user._id,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });
      expect(user.password).toBe(hashedPassword);
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
    });

    it('should handle errors during password reset', async () => {
      const token = 'token123';
      jwt.verify.mockReturnValue({ userId: '12345' });
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/password')
        .send({ token, password: 'newpassword123' });

      expect(res.status).toBe(403);
      expect(res.text).toContain('Invalid token!.');
    });
  });
});
