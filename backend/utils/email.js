const nodemailer = require("nodemailer");
require("dotenv").config();

// Créer le transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Accepte les certificats auto-signés
  },
});

// Test de connexion au serveur SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erreur connexion SMTP:", error);
  } else {
    console.log("✅ Serveur SMTP prêt pour envoyer des emails");
  }
});

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} newPassword - Nouveau mot de passe généré
 * @returns {Promise<boolean>} - Succès de l'envoi
 */
exports.sendPasswordResetEmail = async (email, name, newPassword) => {
  try {
    if (!email || !name || !newPassword) {
      throw new Error("Paramètres manquants pour l'envoi d'email");
    }

    // Template HTML de l'email
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe - CHEDJOU APP</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header .logo {
            font-size: 40px;
            margin-bottom: 15px;
            display: inline-block;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #444;
        }
        .password-box {
            background-color: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .password {
            font-size: 24px;
            font-weight: bold;
            color: #dc3545;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            background-color: #fff;
            padding: 10px 20px;
            border-radius: 6px;
            display: inline-block;
            margin: 10px 0;
        }
        .instructions {
            background-color: #e8f4fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .instructions h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .steps {
            margin: 20px 0;
            padding-left: 20px;
        }
        .steps li {
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .footer {
            background-color: #f1f3f4;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #dee2e6;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        .security-tips {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 22px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1>CHEDJOU APP</h1>
            <p>Gestion d'activités et de transactions</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <h2>Bonjour ${name},</h2>
                <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
            </div>
            
            <div class="password-box">
                <p><strong>Votre nouveau mot de passe :</strong></p>
                <div class="password">${newPassword}</div>
                <p><small>Ce mot de passe a été généré automatiquement</small></p>
            </div>
            
            <div class="instructions">
                <h3>📋 Instructions importantes :</h3>
                <ol class="steps">
                    <li>Utilisez ce mot de passe pour vous connecter à votre compte</li>
                    <li>Après connexion, modifiez votre mot de passe dans la section "Paramètres du compte"</li>
                    <li>Ne partagez jamais votre mot de passe avec qui que ce soit</li>
                </ol>
            </div>
            
            <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "https://chedjou-app.vercel.app"
                }/login" class="button">
                    🚀 Se connecter maintenant
                </a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Attention :</strong> Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et contacter immédiatement l'administrateur.
            </div>
            
            <div class="security-tips">
                <strong>🔒 Conseils de sécurité :</strong>
                <ul style="margin: 10px 0 0 20px;">
                    <li>Changez votre mot de passe régulièrement</li>
                    <li>N'utilisez pas le même mot de passe sur plusieurs sites</li>
                    <li>Activez l'authentification à deux facteurs si disponible</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} CHEDJOU APP. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>Pour toute assistance, contactez : support@chedjou-app.com</p>
        </div>
    </div>
</body>
</html>
    `;

    // Options de l'email
    const mailOptions = {
      from:
        process.env.EMAIL_FROM || `"CHEDJOU APP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Réinitialisation de votre mot de passe - CHEDJOU APP",
      html: htmlContent,
      text: `Bonjour ${name},

Vous avez demandé une réinitialisation de votre mot de passe CHEDJOU APP.

Votre nouveau mot de passe : ${newPassword}

Instructions importantes :
1. Utilisez ce mot de passe pour vous connecter à votre compte
2. Après connexion, modifiez votre mot de passe dans la section "Paramètres du compte"
3. Ne partagez jamais votre mot de passe avec qui que ce soit

Pour vous connecter : ${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/login

⚠️ Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.

Cordialement,
L'équipe CHEDJOU APP

© ${new Date().getFullYear()} CHEDJOU APP. Tous droits réservés.`,
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email envoyé avec succès :");
    console.log(`   📧 À: ${email}`);
    console.log(`   📋 Message ID: ${info.messageId}`);
    console.log(`   ✅ Accepté: ${info.accepted.join(", ")}`);

    return true;
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);

    // Journalisation détaillée de l'erreur
    if (error.code === "EAUTH") {
      console.error(
        "   🔐 Erreur d'authentification - Vérifiez vos identifiants SMTP"
      );
    } else if (error.code === "ESOCKET") {
      console.error("   🔌 Erreur de connexion - Vérifiez les paramètres SMTP");
    } else if (error.code === "ECONNECTION") {
      console.error(
        "   🌐 Erreur de réseau - Vérifiez votre connexion Internet"
      );
    }

    throw error;
  }
};

/**
 * Envoie un email de bienvenue
 * @param {string} email - Adresse email du destinataire
 * @param {string} name - Nom du destinataire
 * @param {string} password - Mot de passe initial
 * @returns {Promise<boolean>} - Succès de l'envoi
 */
exports.sendWelcomeEmail = async (email, name, password) => {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenue sur CHEDJOU APP</h1>
        </div>
        <div class="content">
            <h2>Bonjour ${name},</h2>
            <p>Votre compte a été créé avec succès.</p>
            <p>Vos identifiants :</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Mot de passe :</strong> ${password}</p>
            <p>Connectez-vous et modifiez votre mot de passe dès que possible.</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Bienvenue sur CHEDJOU APP",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenue envoyé à ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur envoi email de bienvenue:", error);
    throw error;
  }
};

// Export pour les tests
exports.testEmail = async () => {
  try {
    const testMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: "Test SMTP CHEDJOU APP",
      text: "Ceci est un email de test. Si vous le recevez, votre configuration SMTP fonctionne correctement.",
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log("✅ Email de test envoyé avec succès");
    console.log("   Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Échec envoi email de test:", error);
    return false;
  }
};
