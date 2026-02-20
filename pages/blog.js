import GiscusComments from '../components/GiscusComments';

export default function Blog() {
  return (
    <div style={{ 
      backgroundColor: '#060b13', 
      color: '#fff', 
      padding: '80px 20px', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif",
      lineHeight: '1.6'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Vissza gomb a főoldalra */}
        <a href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '40px', display: 'inline-block' }}>
          ← Back to WealthyAI
        </a>

        <header style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-1px' }}>
            The WealthyAI Genesis
          </h1>
          <p style={{ color: '#38bdf8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
            February 20, 2026 • Manifest
          </p>
        </header>

        <article style={{ fontSize: '1.2rem', color: '#ccc' }}>
          <p style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '30px', fontWeight: '300', fontStyle: 'italic' }}>
            "We didn’t build WealthyAI to tell people what to do with their money."
          </p>

          <p>
            There are already countless tools that promise clarity, certainty, or even wealth. 
            Most of them collapse under their own promises.
          </p>

          <h3 style={{ color: '#fff', marginTop: '40px' }}>What happens if AI doesn’t advise — but interprets?</h3>
          <p>
            WealthyAI was built around a different question. We are not chasing faster decisions or better predictions. 
            We are building a tool for <strong>clearer thinking</strong>.
          </p>

          <h3 style={{ color: '#fff', marginTop: '40px' }}>Structured around time</h3>
          <p>
            Most AI tools can be exhausted in a single session. Ours cannot — by design. 
            Financial insight changes when context changes, and context changes with time. 
            WealthyAI doesn’t reward speed. It rewards attention.
          </p>

          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '30px' }}>
            <li style={{ marginBottom: '15px' }}>• <strong>A snapshot</strong> shows where you are — without narrative.</li>
            <li style={{ marginBottom: '15px' }}>• <strong>Interpretation</strong> explains what that state actually means.</li>
            <li style={{ marginBottom: '15px' }}>• <strong>Short-term intelligence</strong> observes patterns as they form.</li>
          </ul>

          <div style={{ 
            background: 'rgba(56, 189, 248, 0.05)', 
            borderLeft: '4px solid #38bdf8', 
            padding: '20px', 
            margin: '40px 0',
            color: '#eee'
          }}>
            <strong>Who it’s for:</strong> This system is for people who are tired of oversimplified answers, 
            don’t want to be sold certainty, and value continuity over instant output.
          </div>

          <p>
            WealthyAI is not trying to replace human judgment. It exists to support it — quietly, over time.
          </p>
        </article>

        {/* INTERAKCIÓS RÉSZ */}
        <section style={{ marginTop: '80px', borderTop: '1px solid #1e293b', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Join the Discussion</h2>
          <p style={{ color: '#888', marginBottom: '30px' }}>
            WealthyAI is a living system. We value your perspective on how AI should interpret financial states. 
            Leave a comment below to start the conversation.
          </p>
          
          {/* GISCUS KOMMENTEK */}
          <GiscusComments />
        </section>

      </div>
    </div>
  );
}
