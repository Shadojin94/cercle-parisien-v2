/**
 * Chatbot Martin Li - Frontend Widget
 * Gère l'affichage et la communication avec le backend
 */

(function () {
    // Configuration
    const API_URL = '/api/chat';
    const CHAT_TITLE = "Martin Li - Assistant JKD";
    const WELCOME_MESSAGE = "Bonjour ! Je suis Martin, l'assistant du Cercle. Tu cherches des infos sur les cours ou tu veux t'inscrire ?";

    // Styles injectés dynamiquement
    const styles = `
      #mart-chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: 'Inter', sans-serif;
      }
      
      #mart-chat-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
        border: none;
      }
      
      #mart-chat-toggle:hover {
        transform: scale(1.05);
      }
      
      #mart-chat-toggle svg {
        width: 32px;
        height: 32px;
        color: white;
      }
  
      #mart-chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      }
  
      #mart-chat-window.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
      }
  
      .mart-header {
        background: #1e3a8a;
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
  
      .mart-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .mart-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
      }
  
      .mart-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #f9fafb;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
  
      .mart-msg {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        position: relative;
        word-wrap: break-word;
      }
  
      .mart-msg.bot {
        background: white;
        color: #1f2937;
        align-self: flex-start;
        border-bottom-left-radius: 2px;
        border: 1px solid #e5e7eb;
      }
  
      .mart-msg.user {
        background: #3b82f6;
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 2px;
      }
  
      .mart-input-area {
        padding: 12px;
        background: white;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }
  
      #mart-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 14px;
        background: #f9fafb;
        outline: none;
      }
      
      #mart-input:focus {
        border-color: #3b82f6;
        background: white;
      }
  
      #mart-send {
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
  
      #mart-send:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      
      .mart-typing {
        font-size: 12px;
        color: #6b7280;
        padding-left: 10px;
        opacity: 0;
        transition: opacity 0.2s;
        height: 15px;
      }
  
      .mart-typing.visible {
        opacity: 1;
      }
  
      /* Mobile fast fix */
      @media (max-width: 480px) {
        #mart-chat-window {
          bottom: 0px;
          right: 0px;
          width: 100%;
          height: 80%; /* Almost full screen but leaving top space */
          border-radius: 12px 12px 0 0;
        }
      }
    `;

    // Injection CSS
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // HTML Structure
    const widgetHTML = `
      <div id="mart-chat-widget">
        <button id="mart-chat-toggle" aria-label="Ouvrir le chat">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        
        <div id="mart-chat-window">
          <div class="mart-header">
            <h3>${CHAT_TITLE}</h3>
            <button class="mart-close">×</button>
          </div>
          <div class="mart-messages" id="mart-messages">
            <!-- Messages go here -->
          </div>
          <div class="mart-typing" id="mart-typing">Martin écrit...</div>
          <form class="mart-input-area" id="mart-form">
            <input type="text" id="mart-input" placeholder="Posez votre question..." autocomplete="off" />
            <button type="submit" id="mart-send">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Logic
    const toggleBtn = document.getElementById('mart-chat-toggle');
    const closeBtn = document.querySelector('.mart-close');
    const chatWindow = document.getElementById('mart-chat-window');
    const messagesDiv = document.getElementById('mart-messages');
    const chatForm = document.getElementById('mart-form');
    const inputField = document.getElementById('mart-input');
    const sendBtn = document.getElementById('mart-send');
    const typingIndicator = document.getElementById('mart-typing');

    let history = []; // Historique de session local

    // Init User ID if needed (for backend to track sessions? later)

    // Toggle Window
    function toggleChat() {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) {
            inputField.focus();
            if (history.length === 0) {
                addMessage('bot', WELCOME_MESSAGE);
                history.push({ role: 'assistant', content: WELCOME_MESSAGE });
            }
        }
    }

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', () => chatWindow.classList.remove('open'));

    // Add Message to UI
    function addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('mart-msg', sender);

        // Basic secure rendering to avoid XSS but allow links
        // Simple parse for http links to <a> tags
        const linkified = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" style="color:inherit;text-decoration:underline;">$1</a>'
        );

        msgDiv.innerHTML = linkified; // Be careful, simplistic.
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Handle Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = inputField.value.trim();
        if (!text) return;

        // UI User
        addMessage('user', text);
        inputField.value = '';
        sendBtn.disabled = true;

        // Local History update
        history.push({ role: 'user', content: text });

        // Call API
        typingIndicator.classList.add('visible');

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history })
            });

            const data = await res.json();

            typingIndicator.classList.remove('visible');
            sendBtn.disabled = false;

            if (data.reply) {
                addMessage('bot', data.reply);
                history.push({ role: 'assistant', content: data.reply });
            } else {
                addMessage('bot', "Oups, je n'ai pas compris. Peux-tu reformuler ?");
            }

        } catch (err) {
            console.error(err);
            typingIndicator.classList.remove('visible');
            sendBtn.disabled = false;
            addMessage('bot', "Désolé, j'ai un petit souci de connexion. Réessaie !");
        }
    });

})();
