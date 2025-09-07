import { createBrowserRouter, Navigate } from "react-router-dom";
import ContactList from "./components/ContactList";
import ContactForm from "./components/ContactForm";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/contacts" replace /> },

  { path: "/contacts", element: <ContactList /> },

  { path: "/contacts/add", element: <ContactForm /> },
]);
