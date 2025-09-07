import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';


const ContactContext = createContext();


const API_BASE_URL = 'https://playground.4geeks.com/contact';
const AGENDA_SLUG = 'mi-agenda-unica'; 


const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const createAgenda = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agendas/${AGENDA_SLUG}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
     
      if (!response.ok && response.status !== 400) {
        throw new Error('Error al crear la agenda');
      }
      
      return true;
    } catch (error) {
      console.error('Error creando agenda:', error);
      return false;
    }
  };

  
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      
      await createAgenda();
      
      const response = await fetch(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar los contactos: ${response.status}`);
      }
      
      const data = await response.json();
      
     
      const adaptedContacts = (data.contacts || []).map(contact => ({
        id: contact.id,
        fullName: contact.name,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=6c757d&color=fff&size=150`
      }));
      
      setContacts(adaptedContacts);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const addContact = async (newContact) => {
    setLoading(true);
    setError(null);
    try {
      const contactData = {
        name: newContact.fullName,
        email: newContact.email,
        phone: newContact.phone || '',
        address: newContact.address || ''
      };

      const response = await fetch(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear el contacto');
      }

      const createdContact = await response.json();
      
      
      const adaptedContact = {
        id: createdContact.id,
        fullName: createdContact.name,
        email: createdContact.email,
        phone: createdContact.phone,
        address: createdContact.address,
        avatar: newContact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(createdContact.name)}&background=6c757d&color=fff&size=150`
      };
      
      setContacts(prev => [...prev, adaptedContact]);
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error adding contact:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  
  const updateContact = async (updatedContact) => {
    setLoading(true);
    setError(null);
    try {
      const contactData = {
        name: updatedContact.fullName,
        email: updatedContact.email,
        phone: updatedContact.phone || '',
        address: updatedContact.address || ''
      };

      const response = await fetch(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts/${updatedContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar el contacto');
      }

      const updated = await response.json();
      const adaptedContact = {
        id: updated.id,
        fullName: updated.name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        avatar: updatedContact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updated.name)}&background=6c757d&color=fff&size=150`
      };

      setContacts(prev => prev.map(contact =>
        contact.id === updatedContact.id ? adaptedContact : contact
      ));
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Error updating contact:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  
  const deleteContact = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/agendas/${AGENDA_SLUG}/contacts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
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
      contacts, 
      addContact, 
      updateContact, 
      deleteContact, 
      loading, 
      error,
      fetchContacts 
    }}>
      {children}
    </ContactContext.Provider>
  );
};


const ContactList = () => {
  const { contacts, deleteContact, loading, error, fetchContacts } = useContext(ContactContext);
  const navigate = useNavigate();

  const generateAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c757d&color=fff&size=150`;
  };

  const handleRefresh = () => {
    fetchContacts();
  };

  return (
    <div className="container-fluid px-4 py-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={handleRefresh}
              disabled={loading}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="contact-list-title mb-0">Contactos</h2>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i> Actualizar
          </button>
          <button
            className="btn btn-success"
            onClick={() => navigate('/form')}
            disabled={loading}
          >
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
                    onError={(e) => {
                      e.target.src = generateAvatar(contact.fullName);
                    }}
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
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Por favor, ingresa un nombre completo.';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Por favor, ingresa un correo electrónico.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Por favor, ingresa un correo electrónico válido.';
    }

    
    const duplicateEmail = contacts.find(contact =>
      contact.email.toLowerCase() === formData.email.toLowerCase() &&
      contact.id !== (isEditing ? parseInt(contactId) : null)
    );
    if (duplicateEmail) {
      newErrors.email = 'Ya existe un contacto con este correo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const contactData = {
      ...formData,
      avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=6c757d&color=fff&size=150`
    };

    let success = false;
    
    if (isEditing) {
      success = await updateContact({ ...contactData, id: parseInt(contactId) });
    } else {
      success = await addContact(contactData);
    }
    
    
    if (success) {
      navigate('/');
    }
  };

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
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Nombre Completo *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    id="fullName"
                    name="fullName"
                    placeholder="Introduce el nombre completo"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    placeholder="Introduce el email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    placeholder="Introduce el teléfono"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    placeholder="Introduce la dirección"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                
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
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
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


const App = () => {
  return (
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
};

export default App;