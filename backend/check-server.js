const http = require("http");

console.log(`
🔍 DIAGNOSTIC DU SERVEUR BACKEND
========================================
📅 ${new Date().toLocaleString()}
🌐 URL: http://localhost:5000
========================================
`);

const testEndpoints = [
  {
    path: "/",
    method: "GET",
    description: "Route racine",
    expectedStatus: 200,
  },
  {
    path: "/health",
    method: "GET",
    description: "Route santé (legacy)",
    expectedStatus: 200,
  },
  {
    path: "/api/health",
    method: "GET",
    description: "API santé",
    expectedStatus: 200,
  },
  {
    path: "/api/test",
    method: "GET",
    description: "API test",
    expectedStatus: 200,
  },
  {
    path: "/api/debug",
    method: "GET",
    description: "Debug info",
    expectedStatus: 200,
  },
  {
    path: "/api/nonexistent",
    method: "GET",
    description: "Route inexistante (test 404)",
    expectedStatus: 404,
  },
];

let testsPassed = 0;
let testsFailed = 0;

const runTest = (endpoint) => {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      timeout: 5000,
    };

    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const duration = Date.now() - startTime;
        const statusMatch = res.statusCode === endpoint.expectedStatus;

        if (statusMatch) {
          testsPassed++;
          console.log(`✅ ${endpoint.description}`);
          console.log(`   📍 ${endpoint.path}`);
          console.log(
            `   📊 Status: ${res.statusCode} (attendu: ${endpoint.expectedStatus})`
          );
          console.log(`   ⏱️  Temps: ${duration}ms`);

          try {
            const jsonData = JSON.parse(data);
            console.log(
              `   📦 Réponse: ${JSON.stringify(jsonData).substring(0, 100)}...`
            );
          } catch {
            console.log(`   📦 Réponse: ${data.substring(0, 100)}...`);
          }
        } else {
          testsFailed++;
          console.log(`❌ ${endpoint.description}`);
          console.log(`   📍 ${endpoint.path}`);
          console.log(
            `   📊 Status: ${res.statusCode} (attendu: ${endpoint.expectedStatus})`
          );
          console.log(`   ⏱️  Temps: ${duration}ms`);
          console.log(`   📦 Réponse: ${data.substring(0, 200)}`);
        }

        console.log("   ──────────────────────");
        resolve();
      });
    });

    req.on("error", (err) => {
      testsFailed++;
      const duration = Date.now() - startTime;

      console.log(`💥 ${endpoint.description}`);
      console.log(`   📍 ${endpoint.path}`);
      console.log(`   ❌ Erreur: ${err.message}`);
      console.log(`   ⏱️  Temps: ${duration}ms`);
      console.log("   ──────────────────────");
      resolve();
    });

    req.on("timeout", () => {
      testsFailed++;
      console.log(`⏰ ${endpoint.description} - TIMEOUT`);
      console.log(`   📍 ${endpoint.path}`);
      console.log(`   ⏱️  > 5000ms`);
      console.log("   ──────────────────────");
      req.destroy();
      resolve();
    });

    req.end();
  });
};

(async () => {
  console.log("🧪 Exécution des tests...\n");

  for (const endpoint of testEndpoints) {
    await runTest(endpoint);
  }

  console.log("\n📊 RÉSULTATS DU DIAGNOSTIC");
  console.log("========================================");
  console.log(`✅ Tests réussis: ${testsPassed}/${testEndpoints.length}`);
  console.log(`❌ Tests échoués: ${testsFailed}/${testEndpoints.length}`);
  console.log(
    `📈 Score: ${Math.round((testsPassed / testEndpoints.length) * 100)}%`
  );

  if (testsFailed === 0) {
    console.log("\n🎉 TOUT EST OK! Le serveur fonctionne parfaitement.");
    console.log("   Le frontend devrait pouvoir se connecter.");
  } else if (testsFailed === testEndpoints.length) {
    console.log("\n💥 LE SERVEUR NE RÉPOND PAS!");
    console.log("   Problèmes possibles:");
    console.log("   1. Le serveur n'est pas démarré");
    console.log("   2. Le port 5000 est occupé");
    console.log("   3. Il y a une erreur au démarrage");
    console.log("\n   Solution:");
    console.log("   - Vérifiez les logs: cd backend && yarn dev");
    console.log("   - Vérifiez le port: netstat -ano | findstr :5000");
    console.log("   - Redémarrez le serveur");
  } else {
    console.log("\n⚠️  PROBLÈMES DÉTECTÉS");
    console.log("   Certaines routes ne fonctionnent pas.");
    console.log("   Vérifiez la configuration des routes.");
  }

  console.log("\n🔧 COMMANDES UTILES:");
  console.log("   Démarrer: cd backend && yarn dev");
  console.log("   Tester: curl http://localhost:5000/health");
  console.log("   Vérifier les ports: netstat -ano | findstr :5000");
  console.log("========================================\n");
})();
