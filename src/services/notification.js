// BarberQ Pro - Notification & Voice Announcement Engine

/**
 * Web Speech API Voice Announcement
 */
export const announceCustomerTurn = (customerName, tokenNumber, chairNumber = 1) => {
  if (!('speechSynthesis' in window)) return;

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const text = `Attention please. Token number ${tokenNumber}, ${customerName}, please proceed to barber chair ${chairNumber}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.startsWith('en'));
    if (engVoice) utterance.voice = engVoice;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Voice announcement error:', err);
  }
};

/**
 * Play a pleasant Audio Chime using Web Audio API (no external asset needed)
 */
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First tone (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second tone (G#5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.15);
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
};

/**
 * Browser Push Notification Trigger
 */
export const sendBrowserNotification = (title, body) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '💈',
      badge: '💈'
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '💈' });
      }
    });
  }
};

/**
 * Make phone call link helper
 */
export const makePhoneCallLink = (phone) => {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleanPhone}`;
};

/**
 * Generate formatted WhatsApp / SMS notification text link with multiple template options
 */
export const generateCustomerWhatsAppLink = (phone, customerName, tokenNumber, waitMinutes, shopName = 'BarberQ Pro', templateType = 'READY') => {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  
  let message = '';
  switch (templateType) {
    case 'ADDED':
      message = `👋 Hello ${customerName}!\n\nYou've been added to the queue at *${shopName}*.\nToken: *${tokenNumber}*\nEst. Wait: ~${waitMinutes} mins.\n\nWe will notify you when your turn is coming up!`;
      break;
    case 'REMINDER':
      message = `⏰ Reminder for ${customerName}!\n\nYour turn at *${shopName}* is approaching in ~${waitMinutes} mins.\nToken: *${tokenNumber}*.\n\nPlease stay close to the barbershop!`;
      break;
    case 'COMPLETED':
      message = `✨ Thank you ${customerName} for visiting *${shopName}*!\n\nWe hope you loved your grooming service today. Have a fantastic day ahead! 💈`;
      break;
    case 'READY':
    default:
      message = `📢 Attention ${customerName}!\n\nYour turn is NOW READY at *${shopName}*!\nToken: *${tokenNumber}*\n\nPlease proceed to barber chair 1. Thank you! 💈`;
      break;
  }

  const encodedText = encodeURIComponent(message);
  
  return {
    whatsappUrl: cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`,
    webWhatsappUrl: cleanPhone ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}` : `https://web.whatsapp.com/send?text=${encodedText}`,
    smsUrl: `sms:${cleanPhone}?body=${encodedText}`,
    phoneCallUrl: makePhoneCallLink(phone),
    rawMessage: message
  };
};

