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
      color: '#000', fontSize: 20, pointerEvents: 'none'
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
        border: `2px solid ${disabled ? '#ccc' : '#000'}`,
        borderRadius: 8, fontSize: 15, fontFamily: "'Hanken Grotesk',sans-serif",
        background: disabled ? '#f5f5f5' : 'white', color: '#000',
        outline: 'none', boxSizing: 'border-box'
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
      backgroundColor: '#fafafa',
      fontFamily: "'Hanken Grotesk',sans-serif", padding: '0 0 40px'
    }}>
      {/* Top branding */}
      <div style={{ textAlign: 'center', padding: '40px 24px 20px' }}>
        <div style={{
          width: 68, height: 68, borderRadius: 16,
          backgroundColor: '#fef08a', border: '2px solid #000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', boxShadow: '4px 4px 0px #000'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#000', fontSize: 36 }}>badge</span>
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
          fontSize: 30, color: '#000', margin: '0 0 4px', letterSpacing: -1
        }}>febebo</h1>
        <p style={{ color: '#000', fontSize: 13, margin: 0, fontWeight: 600 }}>
          Staff Portal
        </p>
      </div>

      {/* Main Container Card */}
      <div style={{
        margin: '0 20px', background: 'white',
        borderRadius: 16, padding: '24px 20px',
        border: '2px solid #000',
        boxShadow: '4px 4px 0px #000'
      }}>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 8 }}>Staff Role</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%', padding: '14px 14px 14px 14px',
                  border: `2px solid #000`,
                  borderRadius: 8, fontSize: 15, fontFamily: "'Hanken Grotesk',sans-serif",
                  background: 'white', color: '#000',
                  outline: 'none', boxSizing: 'border-box', appearance: 'none', fontWeight: 600
                }}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#000', pointerEvents: 'none' }}>expand_more</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 8 }}>Name</label>
            <Field 
              icon="person" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 8 }}>Passkey</label>
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
            width: '100%', padding: '16px', borderRadius: 8,
            background: '#fef08a',
            color: '#000', border: '2px solid #000', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '2px 2px 0px #000'
          }}>
            Sign In
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#000', marginTop: 24, padding: '0 24px', fontWeight: 700 }}>
        Staff Passkey: 1234
      </p>
    </div>
  );
}
