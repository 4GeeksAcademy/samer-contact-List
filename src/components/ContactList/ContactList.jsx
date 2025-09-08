import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';

const ContactContext = createContext();
const API_BASE_URL = 'https://playground.4geeks.com/contact';
const AGENDA_SLUG = 'mi-agenda-unica';

// Helper functions
const generateAvatar = (name) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c757d&color=fff&size=150`;

const adaptContact = (contact) => ({
  id: contact.id,
  fullName: contact.name,
  email: contact.email,
  phone: contact.phone,
  address: contact.address,
  avatar: generateAvatar(contact.name)
});

const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      setError(error.message);
      console.error('API Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAgenda = async () => {
    try {
      await fetch(`${API_BASE_URL}/agendas/${AGENDA_SLUG}`, { method: 'POST' });
    } catch (error) {
      console.error('Error creando agenda:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      await createAgenda();
      const data = await apiCall(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts`);
      setContacts((data.contacts || []).map(adaptContact));
    } catch (error) {
      // Error ya manejado en apiCall
    }
  };

  const addContact = async (newContact) => {
    try {
      const contactData = {
        name: newContact.fullName,
        email: newContact.email,
        phone: newContact.phone || '',
        address: newContact.address || ''
      };

      const created = await apiCall(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData)
      });

      const adaptedContact = {
        ...adaptContact(created),
        avatar: newContact.avatar || generateAvatar(created.name)
      };
      
      setContacts(prev => [...prev, adaptedContact]);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateContact = async (updatedContact) => {
    try {
      const contactData = {
        name: updatedContact.fullName,
        email: updatedContact.email,
        phone: updatedContact.phone || '',
        address: updatedContact.address || ''
      };

      const updated = await apiCall(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts/${updatedContact.id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData)
      });

      const adaptedContact = {
        ...adaptContact(updated),
        avatar: updatedContact.avatar || generateAvatar(updated.name)
      };

      setContacts(prev => prev.map(contact =>
        contact.id === updatedContact.id ? adaptedContact : contact
      ));
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al eliminar el contacto');
      }

      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (error) {
      setError(error.message);
      console.error('Error deleting contact:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <ContactContext.Provider value={{ 
      contacts, addContact, updateContact, deleteContact, loading, error, fetchContacts 
    }}>
      {children}
    </ContactContext.Provider>
  );
};

const ContactList = () => {
  const { contacts, deleteContact, loading, error, fetchContacts } = useContext(ContactContext);
  const navigate = useNavigate();

  return (
    <div className="container-fluid px-4 py-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          <div className="d-flex justify-content-between align-items-center">
            <div><strong>Error:</strong> {error}</div>
            <button className="btn btn-sm btn-outline-danger" onClick={fetchContacts} disabled={loading}>
              Reintentar
            </button>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="contact-list-title mb-0">Contactos</h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={fetchContacts} disabled={loading}>
            <i className="fas fa-sync-alt"></i> Actualizar
          </button>
          <button className="btn btn-success" onClick={() => navigate('/form')} disabled={loading}>
            Añadir nuevo contacto
          </button>
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      <div className="contact-cards-container">
        {!loading && contacts.length === 0 ? (
          <div className="no-contacts">
            <p className="text-muted text-center py-5">
              No hay contactos disponibles. ¡Haz clic en "Añadir nuevo contacto" para comenzar!
            </p>
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} className="card mb-3 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <img
                    src={contact.avatar}
                    alt={contact.fullName}
                    className="rounded-circle"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = generateAvatar(contact.fullName); }}
                  />
                </div>
                <div className="flex-grow-1">
                  <h5 className="card-title mb-1">{contact.fullName}</h5>
                  <p className="card-text text-muted mb-1">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {contact.address || 'Sin dirección'}
                  </p>
                  <p className="card-text text-muted mb-1">
                    <i className="fas fa-phone me-2"></i>
                    {contact.phone || 'Sin teléfono'}
                  </p>
                  <p className="card-text text-muted mb-0">
                    <i className="fas fa-envelope me-2"></i>
                    {contact.email}
                  </p>
                </div>
                <div className="flex-shrink-0 ms-auto">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => navigate(`/form/${contact.id}`)}
                    title="Editar contacto"
                    disabled={loading}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => deleteContact(contact.id)}
                    title="Eliminar contacto"
                    disabled={loading}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ContactForm = () => {
  const { contacts, addContact, updateContact, loading, error } = useContext(ContactContext);
  const navigate = useNavigate();
  const { contactId } = useParams();
  const isEditing = contactId !== undefined;

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '', avatar: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const contactToEdit = contacts.find(c => c.id === parseInt(contactId));
      if (contactToEdit) {
        setFormData(contactToEdit);
      } else {
        navigate('/');
      }
    }
  }, [isEditing, contactId, contacts, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Por favor, ingresa un nombre completo.';
    if (!formData.email.trim()) {
      newErrors.email = 'Por favor, ingresa un correo electrónico.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Por favor, ingresa un correo electrónico válido.';
    }

    const duplicateEmail = contacts.find(contact =>
      contact.email.toLowerCase() === formData.email.toLowerCase() &&
      contact.id !== (isEditing ? parseInt(contactId) : null)
    );
    if (duplicateEmail) newErrors.email = 'Ya existe un contacto con este correo.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const contactData = {
      ...formData,
      avatar: formData.avatar || generateAvatar(formData.fullName)
    };

    const success = isEditing 
      ? await updateContact({ ...contactData, id: parseInt(contactId) })
      : await addContact(contactData);
    
    if (success) navigate('/');
  };

  const renderInput = (name, label, type = 'text', required = false, placeholder = '') => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
        id={name}
        name={name}
        placeholder={placeholder || `Introduce ${label.toLowerCase()}`}
        value={formData[name]}
        onChange={handleInputChange}
        disabled={loading}
      />
      {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="container p-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="modal-title">
                {isEditing ? 'Editar Contacto' : 'Añadir Nuevo Contacto'}
              </h5>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                {renderInput('fullName', 'Nombre Completo', 'text', true)}
                {renderInput('email', 'Email', 'email', true)}
                {renderInput('phone', 'Teléfono', 'tel')}
                {renderInput('address', 'Dirección')}
                <div className="mb-3">
                  <label htmlFor="avatar" className="form-label">URL de la foto (Opcional)</label>
                  <input
                    type="url"
                    className="form-control"
                    id="avatar"
                    name="avatar"
                    placeholder="Introduce la URL de la imagen"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <small className="form-text text-muted">
                    Deja en blanco para generar un avatar automático
                  </small>
                </div>
              </div>
              
              <div className="card-footer bg-white d-flex justify-content-between">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {isEditing ? 'Actualizando...' : 'Añadiendo...'}
                    </>
                  ) : (
                    isEditing ? 'Actualizar Contacto' : 'Añadir Contacto'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <ContactProvider>
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <Routes>
          <Route path="/" element={<ContactList />} />
          <Route path="/form" element={<ContactForm />} />
          <Route path="/form/:contactId" element={<ContactForm />} />
        </Routes>
      </div>
    </ContactProvider>
  </BrowserRouter>
);

export default App;