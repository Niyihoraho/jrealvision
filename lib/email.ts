// JREAL VISION DESIGN — Email Service
// Sends transactional verification emails with confirmation codes

import nodemailer from "nodemailer";

interface SendVerificationEmailOptions {
  to: string;
  name: string;
  code: string;
}

function getTransporter(): nodemailer.Transporter {
  // Ensure fresh env
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("dotenv").config();
    } catch {}
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = (process.env.SMTP_USER || "jrealvision@gmail.com").trim();
  const pass = (process.env.SMTP_PASS || "qcegsdmxgpvnycxu").replace(/\s+/g, "");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendVerificationEmail({
  to,
  name,
  code,
}: SendVerificationEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.SMTP_FROM || `"JREAL Support" <jrealvision@gmail.com>`;
  const subject = `${code} is your JREAL account confirmation code`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your JREAL Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid #F1F5F9;">
              <div style="display: inline-block; padding: 10px 18px; background-color: #0F172A; border-radius: 12px;">
                <span style="font-size: 15px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF;">JREAL VISION</span>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #128C38;">
                Creative Studio • Art Marketplace • Commercial Print
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
                Verify your email address
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>${name || "there"}</strong>, thank you for joining JREAL. Please enter the following 6-digit confirmation code to verify your account and complete your registration.
              </p>

              <!-- Confirmation Code Box -->
              <div style="background-color: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
                <span style="display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748B; margin-bottom: 8px;">
                  Your Confirmation Code
                </span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #128C38; display: inline-block; padding: 4px 8px;">
                  ${code}
                </span>
                <span style="display: block; font-size: 11px; color: #94A3B8; margin-top: 8px;">
                  Expires in <strong>10 minutes</strong>
                </span>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #64748B;">
                If you did not request this verification code, please ignore this message. Your account will not be created without confirming this code.
              </p>
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #64748B;">
                JREAL VISION DESIGN LTD • Kigali, Rwanda
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Commercial Print, Brand Identity & Curated Rwandan Art
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `Hello ${name},\n\nYour JREAL account confirmation code is: ${code}\n\nThis code expires in 10 minutes.\n\nJREAL VISION DESIGN — Kigali, Rwanda`,
      html,
    });

    console.log(`[Email] Verification code sent to ${to}: ${code} (MessageID: ${info?.messageId || "local"})`);

    return {
      success: true,
      messageId: info?.messageId,
    };
  } catch (error: any) {
    console.error(`[Email] Failed to send email to ${to}:`, error?.message || error);
    return {
      success: false,
      error: error?.message || "Failed to send email",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTIST ONBOARDING & CURATORIAL EMAILS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sent to the artist when they submit their application (acknowledgement & pending review)
 */
export async function sendArtistApplicationConfirmationEmail({
  to,
  name,
  medium,
  city,
}: {
  to: string;
  name: string;
  medium: string;
  city: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.SMTP_FROM || `"JREAL Curated Fine Art" <jrealvision@gmail.com>`;
  const subject = `Application Received — JREAL Curated Fine Art`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <tr>
            <td style="padding: 32px 36px; background-color: #0F172A; text-align: left;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #10B981; display: block; margin-bottom: 4px;">
                Curatorial Committee
              </span>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                JREAL CURATED FINE ART
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; margin-bottom: 16px;">
                Status: Under Review
              </span>

              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A;">
                Dear ${name || "Artist"},
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for submitting your portfolio for representation with JREAL Curated Fine Art. Your submission has been officially logged in our curatorial review queue.
              </p>

              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h4 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0F172A;">
                  Application Summary
                </h4>
                <table width="100%" style="font-size: 13px; color: #334155; line-height: 1.8;">
                  <tr>
                    <td style="color: #64748B; width: 140px;">Applicant Name:</td>
                    <td style="font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Studio Location:</td>
                    <td style="font-weight: 600;">${city}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Primary Medium:</td>
                    <td style="font-weight: 600;">${medium}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Application Fee:</td>
                    <td style="font-weight: 600; color: #128C38;">None (0 RWF — Free Application)</td>
                  </tr>
                </table>
              </div>

              <h3 style="margin: 24px 0 8px 0; font-size: 14px; font-weight: 700; color: #0F172A;">
                What happens next?
              </h3>
              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                1. Our curatorial board evaluates your body of work, medium, and artist statement.<br>
                2. <strong>No payment or onboarding fee is ever required to apply.</strong><br>
                3. Your Artist Portal access remains pending during evaluation.<br>
                4. As soon as your application is approved by the admin committee, you will receive an approval email with your active portal access credentials.
              </p>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #64748B;">
                Warm regards,<br>
                <strong>Curatorial Committee</strong><br>
                JREAL Curated Fine Art • Kigali, Rwanda
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 36px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 11px; color: #94A3B8;">
              JREAL VISION DESIGN LTD • KG 14 Ave, Kigali, Rwanda • Curated Fine Art & Escrow Protection
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `Hello ${name},\n\nThank you for applying to JREAL Curated Fine Art. Your application is currently under review by our committee.\n\nYou will be notified via email as soon as your portfolio has been evaluated.\n\nJREAL Curated Fine Art • Kigali, Rwanda`,
      html,
    });

    console.log(`[Email] Artist application confirmation sent to ${to} (MessageID: ${info?.messageId || "local"})`);
    return { success: true, messageId: info?.messageId };
  } catch (error: any) {
    console.error(`[Email] Failed to send artist confirmation to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Sent to the Platform Owner / Admin when an artist submits an application
 */
export async function sendAdminArtistApplicationNotificationEmail({
  artistName,
  artistEmail,
  artistPhone,
  city,
  medium,
  portfolioUrl,
  bio,
}: {
  artistName: string;
  artistEmail: string;
  artistPhone: string;
  city: string;
  medium: string;
  portfolioUrl?: string;
  bio: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.SMTP_FROM || `"JREAL Application System" <jrealvision@gmail.com>`;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || "jrealvision@gmail.com";
  const subject = `[New Artist Application] ${artistName} (${city}) — Needs Review`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Artist Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <tr>
            <td style="padding: 28px 36px; background-color: #0F172A; text-align: left;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #F59E0B; display: block; margin-bottom: 4px;">
                Admin Action Required
              </span>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                New Artist Representation Application
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                A new Rwandan artist has applied for representation on the JREAL Curated Fine Art gallery. The applicant has <strong>not</strong> been granted portal access and is awaiting your review and approval.
              </p>

              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" style="font-size: 13px; color: #334155; line-height: 1.9;">
                  <tr>
                    <td style="color: #64748B; width: 130px;">Artist Name:</td>
                    <td style="font-weight: 700; color: #0F172A;">${artistName}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Email:</td>
                    <td><a href="mailto:${artistEmail}" style="color: #128C38; text-decoration: none; font-weight: 600;">${artistEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Phone / WhatsApp:</td>
                    <td style="font-weight: 600;">${artistPhone || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Studio Location:</td>
                    <td style="font-weight: 600;">${city}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Primary Medium:</td>
                    <td style="font-weight: 600;">${medium}</td>
                  </tr>
                  ${
                    portfolioUrl
                      ? `<tr>
                          <td style="color: #64748B;">Portfolio Link:</td>
                          <td><a href="${portfolioUrl}" target="_blank" style="color: #128C38; text-decoration: underline; font-weight: 600;">${portfolioUrl}</a></td>
                        </tr>`
                      : ""
                  }
                </table>

                <div style="margin-top: 16px; pt-3; border-top: 1px solid #E2E8F0;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B; display: block; margin-bottom: 6px;">
                    Artist Statement / Bio:
                  </span>
                  <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #475569; font-style: italic; background-color: #FFFFFF; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
                    "${bio || "No bio provided"}"
                  </p>
                </div>
              </div>

              <!-- Action Link -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/dashboard?tab=sellers" 
                   style="display: inline-block; background-color: #128C38; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(18, 140, 56, 0.25);">
                  Review & Approve in Admin Dashboard →
                </a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `New Artist Application:\n\nName: ${artistName}\nEmail: ${artistEmail}\nPhone: ${artistPhone}\nCity: ${city}\nMedium: ${medium}\nPortfolio: ${portfolioUrl || "N/A"}\n\nReview in Admin Dashboard: /admin/dashboard?tab=sellers`,
      html,
    });

    console.log(`[Email] Admin artist notification sent to ${to} (MessageID: ${info?.messageId || "local"})`);
    return { success: true, messageId: info?.messageId };
  } catch (error: any) {
    console.error(`[Email] Failed to send admin artist notification:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Sent to the artist when the Admin approves their application
 * Links to the dedicated account setup page to create a strong password and confirm email OTP
 */
export async function sendArtistApprovalEmail({
  to,
  name,
  setupUrl,
  loginUrl,
}: {
  to: string;
  name: string;
  setupUrl?: string;
  loginUrl?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.SMTP_FROM || `"JREAL Curated Fine Art" <jrealvision@gmail.com>`;
  const subject = `Welcome to JREAL Fine Art — Set Up Your Artist Portal Access`;
  const actionUrl =
    setupUrl ||
    loginUrl ||
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artist/setup-account?email=${encodeURIComponent(to)}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Application Approved — Set Up Your Portal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <tr>
            <td style="padding: 32px 36px; background-color: #0F172A; text-align: left;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #10B981; display: block; margin-bottom: 4px;">
                Curatorial Board Notice
              </span>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                JREAL CURATED FINE ART
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #DCFCE7; color: #166534; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; margin-bottom: 16px;">
                ✓ Official Representation Approved
              </span>

              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0F172A;">
                Congratulations, ${name || "Artist"}!
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                The Curatorial Board has reviewed and officially approved your application for representation on JREAL Curated Fine Art. Your dedicated <strong>Artist Studio Portal</strong> is ready to be activated.
              </p>

              <!-- Setup Steps Guide -->
              <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h4 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #166534;">
                  3 Easy Steps to Activate Your Portal:
                </h4>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #166534; line-height: 1.8;">
                  <li><strong>Create a Strong Password</strong> (min 8 characters, uppercase, lowercase, numbers & symbols)</li>
                  <li><strong>Enter Confirmation Code</strong> (a 6-digit OTP will be emailed to verify your identity)</li>
                  <li><strong>Access Confirmed Credentials</strong> and enter your Artist Studio Dashboard immediately!</li>
                </ol>
              </div>

              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0F172A;">
                  Your Artist Portal Features:
                </h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                  <li>Upload high-resolution original artworks with Certificate of Authenticity (COA)</li>
                  <li>Set pricing in RWF with secure automated escrow protection</li>
                  <li>Manage exhibition dimensions, framing options, and catalog listings</li>
                  <li>Receive instant collector inquiries and dispatch alerts via Kigali couriers</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${actionUrl}" 
                   style="display: inline-block; background-color: #128C38; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(18, 140, 56, 0.25);">
                  Set Up Password & Activate Artist Portal →
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #64748B;">
                We look forward to showcasing your creative vision to collectors across Rwanda and the diaspora.<br><br>
                Warm regards,<br>
                <strong>Curatorial Committee</strong><br>
                JREAL Curated Fine Art • Kigali, Rwanda
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 36px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 11px; color: #94A3B8;">
              JREAL VISION DESIGN LTD • Kigali, Rwanda • Curated Rwandan Art & Escrow Protection
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `Congratulations ${name}!\n\nYour JREAL Artist Representation application has been approved.\n\nTo activate your Artist Portal, set up your password here:\n${actionUrl}\n\nJREAL Curated Fine Art • Kigali, Rwanda`,
      html,
    });

    console.log(`[Email] Artist approval email sent to ${to} (MessageID: ${info?.messageId || "local"})`);
    return { success: true, messageId: info?.messageId };
  } catch (error: any) {
    console.error(`[Email] Failed to send artist approval email to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Sent to the artist with the 6-digit confirmation code to verify their new password & portal activation
 */
export async function sendArtistConfirmationCodeEmail({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.SMTP_FROM || `"JREAL Artist Security" <jrealvision@gmail.com>`;
  const subject = `[${code}] Your JREAL Artist Portal Confirmation Code`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Portal Confirmation Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <tr>
            <td style="padding: 28px 36px; background-color: #0F172A; text-align: left;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #10B981; display: block; margin-bottom: 4px;">
                Identity Verification
              </span>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                JREAL ARTIST PORTAL
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0F172A;">
                Confirm Your Portal Credentials
              </h1>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>${name || "Artist"}</strong>, please enter the 6-digit confirmation code below on your setup screen to verify your email address and activate your Artist Studio Portal access.
              </p>

              <!-- Confirmation Code Box -->
              <div style="background-color: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748B; margin-bottom: 8px;">
                  6-Digit Confirmation Code
                </span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #128C38; display: inline-block; padding: 4px 8px;">
                  ${code}
                </span>
                <span style="display: block; font-size: 11px; color: #94A3B8; margin-top: 8px;">
                  Code valid for <strong>15 minutes</strong>
                </span>
              </div>

              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; color: #92400E; line-height: 1.5;">
                  🔒 <strong>Security Notice:</strong> Never share this code with anyone. Once confirmed, you will receive full access to manage your fine art catalog and sales escrow.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.6; color: #64748B;">
                If you did not request this activation code, please ignore this email or reach out to our team at <a href="mailto:jrealvision@gmail.com" style="color: #128C38;">jrealvision@gmail.com</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 18px 36px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 11px; color: #94A3B8;">
              JREAL VISION DESIGN LTD • Kigali, Rwanda • Curated Fine Art
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `Your JREAL Artist Portal confirmation code is: ${code}\n\nThis code will expire in 15 minutes.\n\nJREAL Curated Fine Art • Kigali, Rwanda`,
      html,
    });

    console.log(`[Email] Artist OTP code sent to ${to} (MessageID: ${info?.messageId || "local"})`);
    return { success: true, messageId: info?.messageId };
  } catch (error: any) {
    console.error(`[Email] Failed to send artist OTP code to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// E-COMMERCE & STORE ORDER EMAILS (TEST SIMULATION & LIVE PRODUCTION)
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  options?: any;
}

/**
 * Dispatched to the customer who bought the product(s) confirming their purchase.
 */
export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderNumber,
  items,
  total,
  deliveryMethod,
  deliveryAddress,
  paymentMethod,
  isTestMode = false,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  items: OrderEmailItem[];
  total: number;
  deliveryMethod: string;
  deliveryAddress: string;
  paymentMethod: string;
  isTestMode?: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.SMTP_FROM || `"JREAL Orders" <jrealvision@gmail.com>`;
  const subject = `Order Confirmed: ${orderNumber} — JREAL VISION DESIGN ${isTestMode ? "[TEST MODE]" : ""}`;

  const itemsHtml = items
    .map((item) => {
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      const optStr = item.options
        ? typeof item.options === "string"
          ? item.options
          : Object.entries(item.options)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
        : "";

      return `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 14px 12px 14px 0; vertical-align: top;">
            <div style="font-weight: 700; color: #0F172A; font-size: 13px;">${item.name}</div>
            ${optStr ? `<div style="font-size: 11px; color: #64748B; margin-top: 2px;">${optStr}</div>` : ""}
          </td>
          <td style="padding: 14px 12px; text-align: center; vertical-align: top; font-size: 13px; color: #334155;">
            ×${item.quantity || 1}
          </td>
          <td style="padding: 14px 12px; text-align: right; vertical-align: top; font-size: 13px; color: #64748B;">
            ${(item.price || 0).toLocaleString()} RWF
          </td>
          <td style="padding: 14px 0 14px 12px; text-align: right; vertical-align: top; font-weight: 700; color: #0F172A; font-size: 13px;">
            ${lineTotal.toLocaleString()} RWF
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Confirmation ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 36px; background-color: #0F172A; text-align: left;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #10B981; display: block; margin-bottom: 4px;">
                Order Confirmation
              </span>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                JREAL VISION DESIGN LTD
              </h2>
            </td>
          </tr>

          ${
            isTestMode
              ? `<tr>
                  <td style="background-color: #FEF3C7; padding: 10px 36px; border-bottom: 1px solid #FDE68A; font-size: 11px; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 1px;">
                    🧪 TEST / SANDBOX TRANSACTION — Simulated Order (No real charge)
                  </td>
                </tr>`
              : ""
          }

          <!-- Order Body -->
          <tr>
            <td style="padding: 36px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748B; letter-spacing: 1px;">Order Number</span>
                  <div style="font-size: 20px; font-weight: 900; color: #0F172A; font-family: monospace;">${orderNumber}</div>
                </div>
              </div>

              <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0F172A;">
                Thank you for your order, ${customerName}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                We have received your order and our production & fulfillment team in Kigali is preparing your items.
              </p>

              <!-- Items Purchased Table -->
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="border-bottom: 2px solid #E2E8F0; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748B;">
                    <th style="padding-bottom: 8px;">Product</th>
                    <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                    <th style="padding-bottom: 8px; text-align: right;">Unit Price</th>
                    <th style="padding-bottom: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Total Card -->
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <table width="100%" style="font-size: 13px; color: #334155; line-height: 1.8;">
                  <tr>
                    <td style="color: #64748B;">Payment Method:</td>
                    <td style="font-weight: 700; text-align: right; color: #0F172A;">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Delivery Method:</td>
                    <td style="font-weight: 600; text-align: right;">${deliveryMethod}</td>
                  </tr>
                  <tr style="border-top: 1px solid #E2E8F0;">
                    <td style="padding-top: 8px; font-size: 15px; font-weight: 800; color: #0F172A;">Total Paid:</td>
                    <td style="padding-top: 8px; font-size: 16px; font-weight: 900; text-align: right; color: #128C38;">
                      ${total.toLocaleString()} RWF
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Shipping Info -->
              <div style="border-left: 3px solid #128C38; padding-left: 14px; margin-bottom: 24px;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748B; letter-spacing: 1px; display: block; margin-bottom: 4px;">
                  Delivery Destination
                </span>
                <p style="margin: 0; font-size: 13px; color: #0F172A; line-height: 1.5;">
                  ${deliveryAddress}
                </p>
              </div>

              <!-- Customer Portal CTA -->
              <div style="text-align: center; margin: 28px 0 20px 0;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/my-orders" 
                   style="display: inline-block; background-color: #128C38; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 8px rgba(18, 140, 56, 0.2);">
                  View & Track My Order in Customer Portal →
                </a>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.6; color: #64748B;">
                Need help or adjustments with this order? Reply directly to this email or contact us via WhatsApp / Call at <strong>+250 788 888 888</strong>.<br><br>
                Thank you for choosing JREAL VISION DESIGN!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 11px; color: #94A3B8;">
              JREAL VISION DESIGN LTD • Kicukiro Centre, Kigali, Rwanda • Commercial Print & Creative Agency
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `Hello ${customerName},\n\nThank you for your order (${orderNumber}) on JREAL VISION DESIGN.\n\nTotal Paid: ${total.toLocaleString()} RWF\nPayment Method: ${paymentMethod}\nDelivery: ${deliveryAddress}\n\nJREAL VISION DESIGN LTD • Kigali, Rwanda`,
      html,
    });

    console.log(`[Email] Customer order confirmation sent to ${to} for order ${orderNumber} (MessageID: ${info?.messageId || "local"})`);
    return { success: true, messageId: info?.messageId };
  } catch (error: any) {
    console.error(`[Email] Failed to send order confirmation to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Dispatched to the Owner / Administrator notifying that someone placed an order on the store.
 */
export async function sendAdminNewOrderNotificationEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  items,
  total,
  deliveryMethod,
  deliveryAddress,
  paymentMethod,
  orderNotes,
  locationUrl,
  isTestMode = false,
}: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderEmailItem[];
  total: number;
  deliveryMethod: string;
  deliveryAddress: string;
  paymentMethod: string;
  orderNotes?: string;
  locationUrl?: string;
  isTestMode?: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = process.env.SMTP_FROM || `"JREAL Store System" <jrealvision@gmail.com>`;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || "jrealvision@gmail.com";
  const subject = `🛒 [New Store Order] ${orderNumber} - ${customerName} (${total.toLocaleString()} RWF) ${isTestMode ? "[TEST MODE]" : ""}`;

  const itemsList = items
    .map(
      (item) => `
        <li style="margin-bottom: 8px; font-size: 13px; color: #1E293B;">
          <strong>${item.name}</strong> × ${item.quantity || 1} — ${(
            (item.price || 0) * (item.quantity || 1)
          ).toLocaleString()} RWF
          ${
            item.options
              ? `<br><span style="font-size: 11px; color: #64748B;">Options: ${
                  typeof item.options === "string"
                    ? item.options
                    : Object.entries(item.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                }</span>`
              : ""
          }
        </li>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Order Alert ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 36px; background-color: #0F172A; text-align: left;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #F59E0B; display: block; margin-bottom: 4px;">
                Store Sales Alert
              </span>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                New Order Received (${orderNumber})
              </h2>
            </td>
          </tr>

          ${
            isTestMode
              ? `<tr>
                  <td style="background-color: #FEF3C7; padding: 10px 36px; border-bottom: 1px solid #FDE68A; font-size: 11px; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 1px;">
                    🧪 TEST / SANDBOX SIMULATION ORDER
                  </td>
                </tr>`
              : ""
          }

          <!-- Details -->
          <tr>
            <td style="padding: 36px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                A customer has placed an order on the JREAL Store. Here are the purchase details:
              </p>

              <!-- Buyer Card -->
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B;">
                  Customer Information
                </h4>
                <table width="100%" style="font-size: 13px; color: #334155; line-height: 1.8;">
                  <tr>
                    <td style="color: #64748B; width: 140px;">Customer Name:</td>
                    <td style="font-weight: 700; color: #0F172A;">${customerName}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Email Address:</td>
                    <td><a href="mailto:${customerEmail}" style="color: #128C38; font-weight: 600; text-decoration: none;">${customerEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Phone / WhatsApp:</td>
                    <td style="font-weight: 700;"><a href="tel:${customerPhone}" style="color: #0F172A; text-decoration: none;">${customerPhone || "Not provided"}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #64748B;">Delivery Destination:</td>
                    <td style="font-weight: 500;">${deliveryAddress}</td>
                  </tr>
                  ${
                    locationUrl
                      ? `<tr>
                          <td style="color: #64748B;">GPS Map Link:</td>
                          <td><a href="${locationUrl}" target="_blank" style="color: #2563EB; font-weight: 600;">View Exact Location Pin →</a></td>
                        </tr>`
                      : ""
                  }
                  ${
                    orderNotes
                      ? `<tr>
                          <td style="color: #64748B;">Client Notes:</td>
                          <td style="font-style: italic; color: #475569;">"${orderNotes}"</td>
                        </tr>`
                      : ""
                  }
                </table>
              </div>

              <!-- Order Items -->
              <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 10px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748B;">
                  Ordered Items (${items.length}):
                </h4>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                  ${itemsList}
                </ul>
              </div>

              <!-- Payment & Total -->
              <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 18px; margin-bottom: 28px;">
                <table width="100%" style="font-size: 13px; color: #065F46;">
                  <tr>
                    <td>Payment Channel: <strong>${paymentMethod}</strong></td>
                    <td style="text-align: right;">Shipping: <strong>${deliveryMethod}</strong></td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 10px; font-size: 16px; font-weight: 900; color: #047857;">
                      Total Revenue: ${total.toLocaleString()} RWF
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Admin CTA -->
              <div style="text-align: center; margin: 24px 0 12px 0;">
                <a href="http://localhost:3000/admin/dashboard" 
                   style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                  Open Admin Dashboard Orders →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 11px; color: #94A3B8;">
              JREAL VISION DESIGN LTD • Automated System Dispatch
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: `New order ${orderNumber} placed by ${customerName} (${customerEmail}, ${customerPhone}). Total: ${total.toLocaleString()} RWF. Payment: ${paymentMethod}. Delivery: ${deliveryAddress}.`,
      html,
    });

    console.log(`[Email] Admin order notification sent to ${to} for order ${orderNumber} (MessageID: ${info?.messageId || "local"})`);
    return { success: true, messageId: info?.messageId };
  } catch (error: any) {
    console.error(`[Email] Failed to send admin order notification to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}


