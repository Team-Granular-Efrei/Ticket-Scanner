import "../styles/home.css";

export default function Home() {
  return (
    <main className="page">
      <header className="header">
        <h1 className="logo">TicketScanner</h1>
      </header>

      <section className="content">
        <h2 className="title">Scanne tes tickets de caisse</h2>

        <p className="subtitle">Analyse facilement tes dépenses</p>

        <button type="button" className="scan-button">
          Scanner un ticket
        </button>
      </section>
    </main>
  );
}
