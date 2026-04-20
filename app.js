import React, { useEffect, useState } from "react";

export default function App() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/dialprinter69-hue/delicia-menu/refs/heads/main/menu.json")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const sendToWhatsApp = (item) => {
    const message = `Hola! Quiero ordenar:%0A%0A🍽️ ${item.name}%0A💲 ${item.price}%0A%0AGracias!`;
    const phone = "YOUR_NUMBER_HERE";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>🍛 Delicias</h1>
        <p style={styles.subtitle}>Ordena fácil por WhatsApp</p>
      </div>

      {/* SEARCH */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="Buscar platos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando menú...</p>
        ) : (
          filteredMenu.map((item) => (
            <div key={item.id} style={styles.card}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={styles.image}
                />
              )}

              <div style={styles.cardBody}>
                <h3 style={styles.foodName}>{item.name}</h3>
                <p style={styles.description}>{item.description}</p>

                <div style={styles.row}>
                  <span style={styles.price}>{item.price}</span>
                  <button
                    style={styles.button}
                    onClick={() => sendToWhatsApp(item)}
                  >
                    Ordenar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FLOAT BUTTON */}
      <button
        style={styles.floatingButton}
        onClick={() =>
          window.open("https://wa.me/YOUR_NUMBER_HERE", "_blank")
        }
      >
        💬 Ordenar
      </button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    background: "#f6f6f6",
    minHeight: "100vh",
    paddingBottom: "80px",
  },
  header: {
    background: "#ff4d2d",
    color: "white",
    padding: "20px",
    textAlign: "center",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    opacity: 0.9,
  },
  searchBox: {
    padding: "10px",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  content: {
    padding: "10px",
    display: "grid",
    gap: "15px",
  },
  card: {
    background: "white",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "12px",
  },
  foodName: {
    margin: "0 0 5px 0",
    fontSize: "18px",
  },
  description: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontWeight: "bold",
    color: "#ff4d2d",
    fontSize: "16px",
  },
  button: {
    background: "#25D366",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  floatingButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#25D366",
    color: "white",
    border: "none",
    padding: "15px 18px",
    borderRadius: "50px",
    fontSize: "14px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  },
};
