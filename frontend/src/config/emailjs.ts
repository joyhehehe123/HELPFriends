import emailjs from '@emailjs/browser';

export const EMAILJS_SERVICE_ID = 'service_7f9pgz6';
export const EMAILJS_PUBLIC_KEY = 'JBYA197GRPiSAZCps';

export const LOGIN_TEMPLATE_ID = 'template_login_otp';
export const REGISTRATION_TEMPLATE_ID = 'template_registration_otp';

emailjs.init(EMAILJS_PUBLIC_KEY);