import "dotenv/config";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL não encontrada"); process.exit(1); }

const conn = await mysql.createConnection(url);

const influencers = [
  {
    name: "Carolina",
    bio: "Estudante de medicina de 21 anos que revende pijamas Feminnita para ganhar renda extra.",
    personality: "Autêntica, jovem, bem-humorada. Tom casual e próximo.",
    instagram: "carol_influencer.2026",
    tiktok: "@carolinafemi",
  },
  {
    name: "Renata",
    bio: "Mãe de dois filhos que encontrou na revenda Feminnita uma forma de trabalhar em casa com flexibilidade.",
    personality: "Calorosa, madura, confiante. Valoriza qualidade e praticidade.",
    instagram: "renata_influencer.2026",
    tiktok: null,
  },
  {
    name: "Vanessa",
    bio: "Personal trainer que mostra que o descanso faz parte da rotina fit. Revende pijamas Feminnita.",
    personality: "Energética, motivacional, disciplinada mas acessível.",
    instagram: "vanessa_influencer.2026",
    tiktok: null,
  },
  {
    name: "Luiza",
    bio: "Empreendedora que ensina outras mulheres a montarem sua própria revenda lucrativa com Feminnita.",
    personality: "Profissional, estratégica, direta e empoderada.",
    instagram: "luiza_influencer.2026",
    tiktok: null,
  },
];

for (const inf of influencers) {
  await conn.execute(
    `INSERT INTO influencers (userId, name, bio, personality, instagram_handle, tiktok_handle, is_active)
     VALUES (1, ?, ?, ?, ?, ?, true)
     ON DUPLICATE KEY UPDATE bio=VALUES(bio), personality=VALUES(personality), tiktok_handle=VALUES(tiktok_handle)`,
    [inf.name, inf.bio, inf.personality, inf.instagram, inf.tiktok]
  );
  console.log(`✓ ${inf.name} (${inf.instagram})`);
}

await conn.end();
console.log("Influencers cadastradas com sucesso!");
