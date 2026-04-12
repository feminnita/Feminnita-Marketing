import mysql from 'mysql2/promise';

try {
  const connection = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'yYxv22fJFVGxtNz.root',
    password: 'cLa12r8w5PkRzj4w',
    database: 'feminnita',
    ssl: { rejectUnauthorized: true },
  });

  process.stdout.write('Conectado ao banco!\n');

  const [rows] = await connection.execute(
    "SELECT id FROM instagram_accounts WHERE instagramId = '17841459735732076' LIMIT 1"
  );

  process.stdout.write(`Registros encontrados: ${rows.length}\n`);

  if (rows.length > 0) {
    await connection.execute(
      `UPDATE instagram_accounts SET isActive = 1, username = 'feminnita', displayName = 'Feminnita', updatedAt = NOW() WHERE instagramId = '17841459735732076'`
    );
    process.stdout.write('Conta @feminnita atualizada!\n');
  } else {
    await connection.execute(
      `INSERT INTO instagram_accounts (accountType, instagramId, username, displayName, accessToken, isActive, isVerified, createdAt, updatedAt) VALUES ('feminnita', '17841459735732076', 'feminnita', 'Feminnita', '', 1, 0, NOW(), NOW())`
    );
    process.stdout.write('Conta @feminnita inserida!\n');
  }

  await connection.end();
  process.stdout.write('Pronto!\n');
} catch (err) {
  process.stderr.write('ERRO: ' + err.message + '\n');
  process.stderr.write(err.stack + '\n');
}
