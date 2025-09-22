import { createApiUsers } from "./apiUsers";

async function main() {           
  const api = createApiUsers();

  try {
    // Sustituye por usuario/contraseña de pruebas de tu WP
    const session = await api.login("root", "victor", "tJvUxVd8Im8oK2P");
    console.log("✅ Login correcto:", session);

    // Ahora probamos obtener stats de ese autor
    const stats = await api.getUserStatsSummary("root", session.userId, {
      from: "2025-01-01",
      to: "2025-01-31",
    });
    console.log("📊 Stats:", JSON.stringify(stats, null, 2));
  } catch (err: any) {
    console.error("❌ Error:", err.message, err.code || "", err.details || "");
  }
}

main();
