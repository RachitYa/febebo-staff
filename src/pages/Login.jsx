import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roles = [
  'HR', 'Manager', 'Sales Manager', 'Purchase Manager', 
  'Cook', 'Cleaner', 'Helper', 
  'Plumber', 'Electrician', 'Carpenter', 
  'Security Guard', 'Others'
];

const Field = ({ icon, placeholder, type = 'text', value, onChange, disabled, maxLength }) => (
  <div style={{ position: 'relative', marginBottom: 16 }}>
    <span className="material-symbols-outlined" style={{
      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
      color: '#78680a', fontSize: 20, pointerEvents: 'none'
    }}>{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      style={{
        width: '100%', padding: '14px 14px 14px 44px',
        border: `1.5px solid ${disabled ? '#e2e8f0' : '#e8df9a'}`,
        borderRadius: 12, fontSize: 15, fontFamily: "'Hanken Grotesk',sans-serif",
        background: disabled ? '#f5f5f5' : 'white', color: '#1a1500',
        outline: 'none', boxSizing: 'border-box',
        transition: 'all 0.2s'
      }}
    />
  </div>
);

export default function Login() {
  const [name, setName] = useState('');
  const [passkey, setPasskey] = useState('');
  const [selectedRole, setSelectedRole] = useState('Cook');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (passkey === '1234') {
      login(name, 'staff', { name: name.trim(), staffRole: selectedRole });
      navigate('/staff-app');
    } else {
      alert('Invalid Passkey. Use 1234');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      backgroundColor: '#fffdf0',
      fontFamily: "'Hanken Grotesk',sans-serif", padding: '0 0 40px'
    }}>
      {/* Top branding */}
      <div style={{ textAlign: 'center', padding: '50px 24px 24px' }}>
        <div style={{
          width: 68, height: 68, borderRadius: 20,
          backgroundColor: '#fefce8', border: '1px solid #e8df9a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', boxShadow: '0 4px 12px rgba(120, 104, 10, 0.05)'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#78680a', fontSize: 36 }}>badge</span>
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
          fontSize: 32, color: '#1a1500', margin: '0 0 4px', letterSpacing: -1
        }}>febebo</h1>
        <p style={{ color: '#78680a', fontSize: 13, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Staff Portal
        </p>
      </div>

      {/* Main Container Card */}
      <div style={{
        margin: '0 20px', background: 'white',
        borderRadius: 24, padding: '28px 24px',
        border: '1px solid #e8df9a',
        boxShadow: '0 8px 24px rgba(120, 104, 10, 0.06)'
      }}>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1a1500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Staff Role</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%', padding: '14px 44px 14px 14px',
                  border: `1.5px solid #e8df9a`,
                  borderRadius: 12, fontSize: 15, fontFamily: "'Hanken Grotesk',sans-serif",
                  background: 'white', color: '#1a1500',
                  outline: 'none', boxSizing: 'border-box', appearance: 'none', fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#78680a', pointerEvents: 'none' }}>expand_more</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1a1500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Name</label>
            <Field 
              icon="person" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#1a1500', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>Passkey</label>
            <Field 
              icon="lock" 
              type="password"
              placeholder="Enter 4-digit passkey" 
              value={passkey} 
              onChange={e => setPasskey(e.target.value)} 
              maxLength={4}
            />
          </div>

          <button type="submit" style={{
            width: '100%', padding: '16px', borderRadius: 12,
            background: '#fde047',
            color: '#1a1500', border: '1px solid #e8df9a', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(253, 224, 71, 0.25)',
            outline: 'none', transition: 'all 0.15s'
          }}>
            Sign In
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#78680a', marginTop: 32, padding: '0 24px', fontWeight: 800, letterSpacing: 0.3 }}>
        🔐 STAFF PASSKEY: 1234
      </p>
    </div>
  );
}
