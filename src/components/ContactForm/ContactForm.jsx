import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
  const [contacts, setContacts] = useState([]);
  const [showContactsList, setShowContactsList] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const newValidFields = { ...validFields };

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors[name] = 'Please enter a full name.';
          delete newValidFields[name];
        } else {
          delete newErrors[name];
          newValidFields[name] = true;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors[name] = 'Please enter an email address.';
          delete newValidFields[name];
        } else if (!emailRegex.test(value)) {
          newErrors[name] = 'Please enter a valid email address.';
          delete newValidFields[name];
        } else {
          delete newErrors[name];
          newValidFields[name] = true;
        }
        break;
      case 'phone':
        if (value && value.length < 10) {
          newErrors[name] = 'Please enter a valid phone number.';
          delete newValidFields[name];
        } else {
          delete newErrors[name];
          if (value) newValidFields[name] = true;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    setValidFields(newValidFields);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.fullName.trim() || !formData.email.trim()) {
      validateField('fullName', formData.fullName);
      validateField('email', formData.email);
      return;
    }

    // Check for duplicate email
    if (contacts.some(contact => contact.email.toLowerCase() === formData.email.toLowerCase())) {
      alert('A contact with this email already exists!');
      return;
    }

    // Create new contact
    const newContact = {
      ...formData,
      id: Date.now()
    };

    // Add to contacts
    setContacts(prev => [...prev, newContact]);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: ''
    });
    setErrors({});
    setValidFields({});
  };

  const deleteContact = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(contact => contact.id !== id));
    }
  };

  const clearAllContacts = () => {
    if (window.confirm('Are you sure you want to delete all contacts?')) {
      setContacts([]);
    }
  };

  const getFieldClasses = (fieldName) => {
    let classes = 'form-control form-control-lg';
    if (errors[fieldName]) classes += ' is-invalid';
    if (validFields[fieldName]) classes += ' is-valid';
    return classes;
  };

  if (showContactsList) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card mt-5 shadow-sm fade-in">
              <div className="card-body">
                <h3 className="text-center mb-4">Saved Contacts</h3>
                <div className="contacts-list">
                  {contacts.length === 0 ? (
                    <p className="text-center text-muted">No contacts saved yet.</p>
                  ) : (
                    contacts.map(contact => (
                      <div key={contact.id} className="contact-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{contact.fullName}</h5>
                            <p className="mb-1"><strong>Email:</strong> {contact.email}</p>
                            {contact.phone && (
                              <p className="mb-1"><strong>Phone:</strong> {contact.phone}</p>
                            )}
                            {contact.address && (
                              <p className="mb-0"><strong>Address:</strong> {contact.address}</p>
                            )}
                          </div>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteContact(contact.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="text-center mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowContactsList(false)}
                  >
                    Add New Contact
                  </button>
                  <button
                    className="btn btn-outline-danger ms-2"
                    onClick={clearAllContacts}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card mt-5 shadow-sm fade-in">
            <div className="card-body p-5">
              {/* Success Message */}
              {showSuccess && (
                <div className="success-message">
                  <strong>✓ Contact saved successfully!</strong>
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-center mb-4">Add a new contact</h1>
              
              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className={getFieldClasses('fullName')}
                    id="fullName"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.fullName && (
                    <div className="invalid-feedback">{errors.fullName}</div>
                  )}
                </div>
                
                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    className={getFieldClasses('email')}
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                
                {/* Phone */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    className={getFieldClasses('phone')}
                    id="phone"
                    name="phone"
                    placeholder="Enter phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>
                
                {/* Address */}
                <div className="mb-4">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="address"
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Save Button */}
                <div className="d-grid mb-3">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Save Contact
                  </button>
                </div>
                
                {/* View Contacts Link */}
                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link link-primary text-decoration-none"
                    onClick={() => setShowContactsList(true)}
                  >
                    or view all contacts ({contacts.length})
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;