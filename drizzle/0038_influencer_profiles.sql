-- Atualizar/inserir perfis das influencers com handles reais
-- Carol: 21 anos, medicina, TikTok @carolinafemi, Instagram carol_influencer.2026
-- Renata: Instagram renata_influencer.2026
-- Vanessa: Instagram vanessa_influencer.2026
-- Luiza: Instagram luiza_influencer.2026

INSERT INTO influencers (userId, name, bio, personality, instagram_handle, tiktok_handle, is_active, created_at, updated_at)
VALUES
  (
    1,
    'Carolina',
    'Estudante de medicina de 21 anos que revende pijamas Feminnita para ganhar renda extra. Mostra que dá pra ter estilo e conforto mesmo com a rotina corrida da faculdade.',
    'Autêntica, jovem, bem-humorada. Tom casual e próximo, como conversa com amiga. Mistura vida de estudante de medicina com moda e autocuidado.',
    'carol_influencer.2026',
    '@carolinafemi',
    true,
    NOW(),
    NOW()
  ),
  (
    1,
    'Renata',
    'Mãe de dois filhos que encontrou na revenda de pijamas Feminnita uma forma de trabalhar em casa com flexibilidade e ter renda própria.',
    'Calorosa, madura, confiante. Fala de igual para igual com outras mães. Valoriza qualidade, conforto e praticidade.',
    'renata_influencer.2026',
    NULL,
    true,
    NOW(),
    NOW()
  ),
  (
    1,
    'Vanessa',
    'Personal trainer e influencer de lifestyle saudável que mostra que o descanso também faz parte da rotina fit. Revende pijamas Feminnita como parte de um estilo de vida equilibrado.',
    'Energética, motivacional, disciplinada mas acessível. Liga moda confortável com saúde e bem-estar.',
    'vanessa_influencer.2026',
    NULL,
    true,
    NOW(),
    NOW()
  ),
  (
    1,
    'Luiza',
    'Empreendedora e consultora de negócios que ensina outras mulheres a montarem sua própria revenda lucrativa com os pijamas Feminnita.',
    'Profissional, estratégica, direta e empoderada. Foca em resultados, números e estratégias práticas.',
    'luiza_influencer.2026',
    NULL,
    true,
    NOW(),
    NOW()
  )
ON DUPLICATE KEY UPDATE
  bio = VALUES(bio),
  personality = VALUES(personality),
  tiktok_handle = VALUES(tiktok_handle),
  is_active = VALUES(is_active),
  updated_at = NOW();
