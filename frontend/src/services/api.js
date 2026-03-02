import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const fetchEvents = () => API.get('/events');
export const fetchCategories = () => API.get('/categories');
// Thêm các hàm khác (login, register) tại đây sau này