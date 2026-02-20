import GiscusComments from '../components/GiscusComments';

export default function Blog() {
  return (
    <div style={{ backgroundColor: '#000', color: '#fff', padding: '50px', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>WealthyAI Blog</h1>
      <p style={{ fontSize: '1.2rem', color: '#ccc' }}>Building the future of AI wealth management.</p>
      
      <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '20px' }}>
        <h2>First Post: Why we built WealthyAI</h2>
        <p>This is where your story starts...</p>
      </div>

      {/* Itt jelenik meg a kommentszekció */}
      <GiscusComments />
    </div>
  );
}
