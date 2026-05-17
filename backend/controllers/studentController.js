const Student = require('../models/Student');

// @desc    Create new student
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, department } = req.body;

    // Basic validation
    if (!name || !rollNumber || !email || !department) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if student already exists by email or rollNumber
    const studentExists = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Student with this email or roll number already exists' });
    }

    // Create the student
    const student = await Student.create({
      name,
      rollNumber,
      email,
      department
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Student not found (Invalid ID)' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student by ID
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedStudent);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Student not found (Invalid ID)' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student by ID
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Student removed successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Student not found (Invalid ID)' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search students by name or roll number
// @route   GET /api/students/search?q=
const searchStudents = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    const students = await Student.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { rollNumber: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents
};
