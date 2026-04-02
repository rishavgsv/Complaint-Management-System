/**
 * whatsappService.js
 *
 * Uses whatsapp-web.js to send real WhatsApp messages.
 * Falls back to console logging if the client fails to initialise
 * (e.g. on Windows with MAX_PATH limitations).
 */

let sendWhatsAppMessageImpl = null;
let clientReady = false;

const initClient = async () => {
  try {
    const { default: pkg } = await import('whatsapp-web.js');
    const { Client, LocalAuth } = pkg;
    const { default: qrcode } = await import('qrcode-terminal');

    const client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    client.on('qr', (qr) => {
      console.log('\n═══════════════════════════════════════════════════');
      console.log('   📱 SCAN THIS QR CODE IN WHATSAPP TO CONNECT   ');
      console.log('═══════════════════════════════════════════════════\n');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      clientReady = true;
      console.log('✅ WhatsApp Web Client is ready and connected!');
    });

    client.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp auth failed:', msg);
      clientReady = false;
    });

    client.on('disconnected', (reason) => {
      console.warn('⚠️  WhatsApp disconnected:', reason);
      clientReady = false;
    });

    sendWhatsAppMessageImpl = async (to, message) => {
      if (!clientReady) {
        console.log(`[WhatsApp] Client not ready. Logging message to ${to}:\n${message}`);
        return;
      }
      const formattedNumber = to.replace(/\D/g, '');
      const chatId = `${formattedNumber}@c.us`;
      await client.sendMessage(chatId, message);
      console.log(`✅ WhatsApp message sent to ${to}`);
    };

    await client.initialize();
  } catch (err) {
    console.error('⚠️  whatsapp-web.js failed to load (likely a Windows path issue).');
    console.error('   WhatsApp messages will be printed to console instead.');
    console.error('   Error:', err.message);
    sendWhatsAppMessageImpl = null;
  }
};

// Start initialisation in background — does NOT block server startup
initClient();

/**
 * Send a WhatsApp message.
 * @param {string} to - Phone number with country code, e.g. "+923001234567"
 * @param {string} message - Text message body
 */
export const sendWhatsAppMessage = async (to, message) => {
  if (!sendWhatsAppMessageImpl) {
    console.log('\n[MOCK WHATSAPP MESSAGE]');
    console.log(`To:      ${to}`);
    console.log(`Message: ${message}`);
    console.log('─────────────────────────────────────\n');
    return;
  }
  try {
    await sendWhatsAppMessageImpl(to, message);
  } catch (error) {
    console.error('❌ WhatsApp send failed:', error.message);
  }
};
