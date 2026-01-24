import React from 'react';

export default function ProMetricsCards({ income, fixed, variable }) {
  const expenses = fixed + variable;
  const surplus = income - expenses;
  const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

  const projected5Y = surplus * 60 * 1.45;

  const risk =
    savingsRate < 0 ? 'Critical'
    : savingsRate < 10 ? 'High'
    : savingsRate < 20 ? 'Medium'
    : 'Healthy';

  const riskColor =
    risk === 'Critical' ? '#ef4444'
    : risk === 'High' ? '#f97316'
    : risk === 'Medium' ? '#facc15'
    : '#10b981';

  const cards = [
    { label: 'Monthly Surplus', value: `$${surplus.toLocaleString()}` },
    { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%` },
    { label: 'Risk Level', value: risk, color: riskColor },
    { label: '5Y Projection', value: `$${projected5Y.toLocaleString()}` },
  ];

  return (
    <div style={grid}>
      {cards.map((c, i) => (
        <div key={i} style={card}>
          <p style={label}>{c.label}</p>
          <h2 style={{ ...value, color: c.color || '#fff' }}>{c.value}</h2>
        </div>
      ))}
    </div>
  );
}

/* styles */
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
};

const card = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '14px',
  padding: '20px',
};

const label = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 'bold',
  marginBottom: '6px',
};

const value = {
  fontSize: '1.9rem',
  margin: 0,
};
