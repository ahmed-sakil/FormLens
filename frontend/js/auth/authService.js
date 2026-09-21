import { supabaseClient } from './supabaseClient.js';

export async function register(name, email, password) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { full_name: name } } });
  if (error) throw error;
  return data;
}

export async function login(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function forgotPassword(email) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password.html'
  });
  if (error) throw error;
}

export async function resetPassword(newPassword) {
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  return supabaseClient.auth.onAuthStateChange(callback);
}

export async function getToken() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session?.access_token;
}

export async function resendConfirmation(email) {
  const { error } = await supabaseClient.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

