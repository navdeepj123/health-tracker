export const validateEmail = (email: string): string => {
  if (!email) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address';
  return '';
};
export const validatePassword = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};
export const validateName = (name: string): string => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return '';
};
export const validateNumber = (value: string, fieldName: string): string => {
  if (!value) return `${fieldName} is required`;
  if (isNaN(Number(value)) || Number(value) <= 0) return `${fieldName} must be greater than 0`;
  return '';
};
