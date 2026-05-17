const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Student = require('../models/Student');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup in-memory database for testing
beforeAll(async () => {
  // Use in-memory MongoDB to avoid mutating a real database
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear the database after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('Student API Endpoints', () => {
  const sampleStudent = {
    name: 'John Doe',
    rollNumber: 'CS101',
    email: 'john@example.com',
    department: 'Computer Science'
  };

  describe('POST /api/students', () => {
    it('should create a new student (valid case)', async () => {
      const res = await request(app)
        .post('/api/students')
        .send(sampleStudent);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual(sampleStudent.name);
    });

    it('should not create a student without required fields (invalid case)', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ name: 'Incomplete Student' }); // Missing other required fields
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should not create a student with duplicate email/rollNumber (invalid case)', async () => {
      await Student.create(sampleStudent);
      
      const res = await request(app)
        .post('/api/students')
        .send(sampleStudent); // sending same student again
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/exists/);
    });
  });

  describe('GET /api/students', () => {
    it('should get all students', async () => {
      await Student.create(sampleStudent);
      
      const res = await request(app).get('/api/students');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toEqual(sampleStudent.name);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get a single student by id', async () => {
      const student = await Student.create(sampleStudent);
      
      const res = await request(app).get(`/api/students/${student._id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(student._id.toString());
    });

    it('should return 404 for non-existent student', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/students/${fakeId}`);
      
      expect(res.statusCode).toEqual(404);
    });

    it('should return 404 for invalid ID format', async () => {
      const res = await request(app).get('/api/students/invalid123');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update a student', async () => {
      const student = await Student.create(sampleStudent);
      
      const res = await request(app)
        .put(`/api/students/${student._id}`)
        .send({ department: 'Mathematics' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.department).toEqual('Mathematics');
      
      // verify it's updated in db
      const updatedStudent = await Student.findById(student._id);
      expect(updatedStudent.department).toEqual('Mathematics');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete a student', async () => {
      const student = await Student.create(sampleStudent);
      
      const res = await request(app).delete(`/api/students/${student._id}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Student removed successfully');
      
      const checkStudent = await Student.findById(student._id);
      expect(checkStudent).toBeNull();
    });
  });

  describe('GET /api/students/search?q=', () => {
    it('should search students by name or roll number', async () => {
      await Student.create(sampleStudent);
      await Student.create({
        name: 'Jane Smith',
        rollNumber: 'MATH202',
        email: 'jane@example.com',
        department: 'Mathematics'
      });

      const res1 = await request(app).get('/api/students/search?q=John');
      expect(res1.statusCode).toEqual(200);
      expect(res1.body.length).toEqual(1);
      expect(res1.body[0].name).toEqual('John Doe');

      const res2 = await request(app).get('/api/students/search?q=MATH202');
      expect(res2.statusCode).toEqual(200);
      expect(res2.body.length).toEqual(1);
      expect(res2.body[0].name).toEqual('Jane Smith');
    });
    
    it('should return 400 if no search query provided', async () => {
      const res = await request(app).get('/api/students/search');
      expect(res.statusCode).toEqual(400);
    });
  });
});
