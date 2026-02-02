// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation: min 6 characters and must include numbers
const isValidPassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must include at least one number" };
  }
  return { valid: true };
};

// Name validation: not empty and minimum 2 characters
const isValidName = (name) => {
  if (!name || name.trim().length < 2) {
    return { valid: false, message: "Name must be at least 2 characters" };
  }
  return { valid: true };
};

// Phone validation: 10 digits OR Egyptian format (+20xxxxxxxxxx)
const isValidPhone = (phone) => {
  // Remove spaces and hyphens
  const cleanPhone = phone.replace(/[\s-]/g, "");
  
  // Check if 10 digits only
  if (/^\d{10}$/.test(cleanPhone)) {
    return { valid: true };
  }
  
  // Check Egyptian format (+20xxxxxxxxxx)
  if (/^\+20\d{10}$/.test(cleanPhone)) {
    return { valid: true };
  }
  
  return { 
    valid: false, 
    message: "Phone must be 10 digits or Egyptian format (+20xxxxxxxxxx)" 
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidPhone
};
