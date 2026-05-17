import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'http://localhost:5000/api/students';

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch students');
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return fetchStudents();
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/search?q=${searchQuery}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Search failed');
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      setSuccess(`Student successfully ${editingId ? 'updated' : 'added'}!`);
      setFormData({ name: '', rollNumber: '', email: '', department: '' });
      setEditingId(null);
      fetchStudents();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      department: student.department
    });
    setEditingId(student._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      
      setSuccess('Student deleted successfully!');
      fetchStudents();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', rollNumber: '', email: '', department: '' });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Student Management Hub</h1>
        <p>Manage your university records seamlessly</p>
      </header>

      <div className="main-content">
        <aside>
          <div className="card">
            <h2 className="card-title">
              {editingId ? 'Edit Student' : 'Add New Student'}
            </h2>
            
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  className="form-control"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. CS101"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Student' : 'Add Student'}
              </button>
              
              {editingId && (
                <button 
                  type="button" 
                  className="btn" 
                  style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#e5e7eb', color: '#374151' }}
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </aside>

        <main>
          <div className="card">
            <h2 className="card-title">Student Directory</h2>
            
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                Search
              </button>
            </form>

            {loading ? (
              <div className="loader"></div>
            ) : (
              <div className="table-container">
                {students.length > 0 ? (
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>Roll No.</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student._id}>
                          <td><strong>{student.rollNumber}</strong></td>
                          <td>
                            <div>{student.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {student.email}
                            </div>
                          </td>
                          <td>
                            <span className="badge">{student.department}</span>
                          </td>
                          <td className="actions">
                            <button 
                              onClick={() => handleEdit(student)}
                              className="btn btn-edit"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(student._id)}
                              className="btn btn-danger"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                    No students found. Add one to get started!
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
