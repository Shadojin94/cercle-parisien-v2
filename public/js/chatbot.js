/**
 * Agent de Conversion - Cercle Parisien de Jeet Kune Do
 * Widget Chatbot avec gestion des sessions et actions (liens de paiement)
 * Design: Rouge/Noir/Blanc, Animations GSAP, Responsive Mobile First
 */

(function () {
  // Configuration
  const API_URL = '/api/chat';
  const CHAT_TITLE = "Cercle Parisien JKD";
  const BRAND_RED = "#c8102e";
  const BRAND_BLACK = "#111111";
  const WELCOME_MESSAGE = "Salut ! On est le Cercle Parisien de Jeet Kune Do. Tu cherches des infos sur nos cours ou tu veux tester ?";

  // Session ID - persiste pendant la visite
  let sessionId = sessionStorage.getItem('cpjkd_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('cpjkd_session_id', sessionId);
  }

  // Charger GSAP dynamiquement
  const scriptGsap = document.createElement('script');
  scriptGsap.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
  document.head.appendChild(scriptGsap);

  // Styles injectés (Design System CPJKD)
  const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

      #mart-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      /* Bouton Flottant (Pulse Animation) */
      #mart-toggle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: ${BRAND_RED};
        box-shadow: 0 4px 20px rgba(200, 16, 46, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        border: none;
        outline: none;
        position: relative;
        z-index: 20;
        animation: mart-pulse 2s infinite;
      }

      @keyframes mart-pulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(200, 16, 46, 0.4); }
        50% { box-shadow: 0 4px 30px rgba(200, 16, 46, 0.6); }
      }

      #mart-toggle:hover {
        transform: scale(1.1) rotate(5deg);
        animation: none;
      }

      #mart-toggle svg {
        width: 32px;
        height: 32px;
        color: white;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
      }

      /* Indicateur de notif */
      .mart-badge {
        position: absolute;
        top: 0;
        right: 0;
        width: 16px;
        height: 16px;
        background: white;
        border: 2px solid ${BRAND_RED};
        border-radius: 50%;
        opacity: 0;
      }

      /* Fenêtre de Chat */
      #mart-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        max-height: 80vh;
        background: white;
        border-radius: 20px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform-origin: bottom right;
        opacity: 0;
        visibility: hidden;
        border: 1px solid rgba(0,0,0,0.05);
      }

      /* Header */
      .mart-header {
        background: ${BRAND_BLACK};
        color: white;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 3px solid ${BRAND_RED};
      }

      .mart-profile {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .mart-avatar {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: 2px solid ${BRAND_RED};
      }

      .mart-info h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: -0.02em;
      }

      .mart-info span {
        font-size: 12px;
        opacity: 0.8;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .mart-info span::before {
        content: '';
        display: block;
        width: 6px;
        height: 6px;
        background: #10b981;
        border-radius: 50%;
      }

      .mart-close-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .mart-close-btn:hover {
        background: rgba(255,255,255,0.2);
      }

      /* Zone Messages */
      .mart-body {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: #f8f9fa;
        display: flex;
        flex-direction: column;
        gap: 16px;
        scroll-behavior: smooth;
      }

      .mart-msg {
        max-width: 85%;
        padding: 14px 18px;
        font-size: 15px;
        line-height: 1.5;
        position: relative;
        box-shadow: 0 2px 5px rgba(0,0,0,0.03);
        word-wrap: break-word;
      }

      .mart-msg.bot {
        background: white;
        color: #1f2937;
        border-radius: 18px 18px 18px 4px;
        align-self: flex-start;
        border: 1px solid #e5e7eb;
      }

      .mart-msg.user {
        background: ${BRAND_RED};
        color: white;
        border-radius: 18px 18px 4px 18px;
        align-self: flex-end;
        box-shadow: 0 4px 15px rgba(200, 16, 46, 0.2);
      }

      .mart-msg a {
        color: inherit;
        text-decoration: underline;
        font-weight: 600;
      }

      .mart-msg.bot a {
        color: ${BRAND_RED};
      }

      /* Bouton d'action (lien de paiement) */
      .mart-action-btn {
        display: inline-block;
        background: ${BRAND_RED};
        color: white !important;
        text-decoration: none !important;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: 600;
        margin-top: 10px;
        text-align: center;
        transition: all 0.2s;
        box-shadow: 0 4px 15px rgba(200, 16, 46, 0.3);
      }

      .mart-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(200, 16, 46, 0.4);
      }

      /* Typing Indicator */
      .mart-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border-radius: 18px;
        align-self: flex-start;
        width: fit-content;
        border: 1px solid #e5e7eb;
        opacity: 0;
        display: none;
      }

      .mart-dot {
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        animation: martBounce 1.4s infinite ease-in-out both;
      }

      .mart-dot:nth-child(1) { animation-delay: -0.32s; }
      .mart-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes martBounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      /* Input Zone */
      .mart-footer {
        padding: 16px;
        background: white;
        border-top: 1px solid #f0f0f0;
      }

      .mart-input-wrapper {
        display: flex;
        gap: 10px;
        background: #f3f4f6;
        padding: 8px;
        border-radius: 30px;
        border: 1px solid transparent;
        transition: all 0.2s;
      }

      .mart-input-wrapper:focus-within {
        background: white;
        border-color: ${BRAND_RED};
        box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.1);
      }

      #mart-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 8px 12px;
        font-size: 15px;
        outline: none;
        color: #1f2937;
      }

      #mart-send {
        background: ${BRAND_RED};
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      #mart-send:disabled {
        background: #e5e7eb;
        cursor: not-allowed;
      }

      #mart-send:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 2px 10px rgba(200, 16, 46, 0.3);
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        #mart-window {
          position: fixed;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 100%;
          max-height: 100%;
          border-radius: 0;
          z-index: 10001;
        }

        #mart-widget {
          bottom: 20px;
          right: 20px;
        }

        .mart-msg {
          max-width: 90%;
        }
      }
    `;

  // Injection CSS
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);


  // HTML Structure
  const widgetHTML = `
      <div id="mart-widget">
        <!-- Fenêtre -->
        <div id="mart-window">
          <div class="mart-header">
            <div class="mart-profile">
              <div class="mart-avatar">🥋</div>
              <div class="mart-info">
                <h3>${CHAT_TITLE}</h3>
                <span>En ligne</span>
              </div>
            </div>
            <button class="mart-close-btn" aria-label="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mart-body" id="mart-body">
            <!-- Messages -->
            <div class="mart-typing" id="mart-typing">
              <div class="mart-dot"></div>
              <div class="mart-dot"></div>
              <div class="mart-dot"></div>
            </div>
          </div>

          <form class="mart-footer" id="mart-form">
            <div class="mart-input-wrapper">
              <input type="text" id="mart-input" placeholder="Posez votre question..." autocomplete="off" />
              <button type="submit" id="mart-send">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </form>
        </div>

        <!-- Bouton Toggle -->
        <button id="mart-toggle" aria-label="Ouvrir le chat">
          <div class="mart-badge"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Elements
  const toggleBtn = document.getElementById('mart-toggle');
  const closeBtn = document.querySelector('.mart-close-btn');
  const windowEl = document.getElementById('mart-window');
  const messagesBody = document.getElementById('mart-body');
  const form = document.getElementById('mart-form');
  const input = document.getElementById('mart-input');
  const sendBtn = document.getElementById('mart-send');
  const typingIndicator = document.getElementById('mart-typing');

  let isOpen = false;
  let history = [];

  // GSAP Helper (Wait for script load)
  const animate = (cb) => {
    if (window.gsap) cb();
    else setTimeout(() => animate(cb), 100);
  };

  // Toggle Logic
  const toggleChat = () => {
    isOpen = !isOpen;

    animate(() => {
      if (isOpen) {
        // Open Animation
        gsap.to(windowEl, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.2)"
        });
        gsap.to(toggleBtn, { scale: 0, duration: 0.2 });
        input.focus();

        // Welcome msg if empty
        if (history.length === 0) {
          setTimeout(() => addMessage('bot', WELCOME_MESSAGE), 300);
          history.push({ role: 'assistant', content: WELCOME_MESSAGE });
        }
      } else {
        // Close Animation
        gsap.to(windowEl, {
          autoAlpha: 0,
          scale: 0.8,
          duration: 0.3,
          ease: "power2.in"
        });
        gsap.to(toggleBtn, { scale: 1, duration: 0.3, delay: 0.1 });
      }
    });
  };

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // Add Message avec support des actions (liens de paiement)
  const addMessage = (role, text, actions = []) => {
    const div = document.createElement('div');
    div.className = `mart-msg ${role}`;

    // Transformer les URLs en liens cliquables
    let content = text.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );

    div.innerHTML = content;

    // Ajouter des boutons d'action si présents (liens de paiement)
    if (actions && actions.length > 0) {
      actions.forEach(action => {
        if (action.type === 'payment_link' && action.url) {
          const btnContainer = document.createElement('div');
          btnContainer.style.marginTop = '12px';

          const btn = document.createElement('a');
          btn.href = action.url;
          btn.target = '_blank';
          btn.rel = 'noopener';
          btn.className = 'mart-action-btn';
          btn.textContent = `Réserver (${action.price}€)`;

          btnContainer.appendChild(btn);
          div.appendChild(btnContainer);
        }
      });
    }

    messagesBody.insertBefore(div, typingIndicator);
    messagesBody.scrollTop = messagesBody.scrollHeight;

    // Message Animation
    animate(() => {
      gsap.fromTo(div,
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    });
  };

  // Typing Logic
  const showTyping = (show) => {
    typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) {
      typingIndicator.style.opacity = 0;
      animate(() => gsap.to(typingIndicator, { opacity: 1, duration: 0.2 }));
      messagesBody.scrollTop = messagesBody.scrollHeight;
    }
  };

  // Submit Logic
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // User Msg
    addMessage('user', text);
    input.value = '';
    history.push({ role: 'user', content: text });

    // API Call
    showTyping(true);
    sendBtn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          sessionId: sessionId
        })
      });
      const data = await res.json();

      showTyping(false);
      sendBtn.disabled = false;

      // Mettre à jour le sessionId si le serveur en renvoie un nouveau
      if (data.sessionId) {
        sessionId = data.sessionId;
        sessionStorage.setItem('cpjkd_session_id', sessionId);
      }

      if (data.reply) {
        // Ajouter le message avec les actions potentielles
        addMessage('bot', data.reply, data.actions || []);
        history.push({ role: 'assistant', content: data.reply });
      } else {
        addMessage('bot', "Je n'ai pas compris, tu peux reformuler ?");
      }
    } catch (err) {
      console.error('Erreur chatbot:', err);
      showTyping(false);
      sendBtn.disabled = false;
      addMessage('bot', "Oups, petit souci de connexion. Tu peux réessayer ?");
    }
  });

})();
