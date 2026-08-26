document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const plusBtn = document.getElementById('plus-btn');
  const plusPopover = document.getElementById('plus-popover');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPopover = document.getElementById('settings-popover');
  const userProfileBtn = document.getElementById('user-profile-btn');
  const accountPopover = document.getElementById('account-popover');
  
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const chatContainer = document.getElementById('chat-container');

  // 1. 側邊欄開關
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.body.classList.add('sidebar-collapsed');
    });
  }

  // 2. 「+」選單開關
  if (plusBtn && plusPopover) {
    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (settingsPopover) settingsPopover.classList.remove('active');
      if (accountPopover) accountPopover.classList.remove('active');
      plusPopover.classList.toggle('active');
    });
  }

  // 3. 設定齒輪選單開關
  if (settingsBtn && settingsPopover) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (plusPopover) plusPopover.classList.remove('active');
      if (accountPopover) accountPopover.classList.remove('active');
      settingsPopover.classList.toggle('active');
    });
  }

  // 4. 帳戶切換選單開關
  if (userProfileBtn && accountPopover) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (plusPopover) plusPopover.classList.remove('active');
      if (settingsPopover) settingsPopover.classList.remove('active');
      accountPopover.classList.toggle('active');
    });
  }

  // 5. 發送訊息與串接後端邏輯
  async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 移除歡迎標題（如果還在的話）
    const welcomeTitle = chatContainer.querySelector('.welcome-title');
    if (welcomeTitle) {
      welcomeTitle.remove();
    }

    // 在畫面上顯示使用者訊息
    appendMessage('user', text);
    userInput.value = '';

    // 顯示 AI 思考中狀態
    const loadingId = appendMessage('ai', '思考中...');

    try {
      // 發送請求到你的 FastAPI 後端（請確認你的 main.py 路由是否為 /chat）
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error('後端伺服器回應錯誤');
      }

      const data = await response.json();
      // 支援後端常見的回傳欄位名稱 (reply, response, text 等)
      const replyText = data.reply || data.response || data.text || JSON.stringify(data);

      // 更新 AI 回應內容
      updateMessage(loadingId, replyText);

    } catch (error) {
      console.error(error);
      updateMessage(loadingId, '無法連線至後端伺服器，請檢查 FastAPI 是否正常運行。');
    }
  }

  // 在畫面上新增一則訊息泡泡（已完全移除藍色頭像）
  function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now() + Math.random();
    messageDiv.id = messageId;
    messageDiv.className = `chat-message ${sender}`;

    // 不管是使用者還是 AI，都只顯示純文字內容，絕對不加入任何頭像
    messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageId;
  }

  // 更新指定訊息的文字（例如將「思考中...」換成 AI 的回答）
  function updateMessage(messageId, text) {
    const msgDiv = document.getElementById(messageId);
    if (msgDiv) {
      const contentDiv = msgDiv.querySelector('.message-content');
      if (contentDiv) {
        contentDiv.textContent = text;
      }
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // 防止 XSS 的跳脫字元函式
  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }

  if (userInput) {
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }

  // 6. 點擊頁面其他地方時關閉浮動選單
  document.addEventListener('click', (e) => {
    if (plusPopover && !plusPopover.contains(e.target) && e.target !== plusBtn) {
      plusPopover.classList.remove('active');
    }
    if (settingsPopover && !settingsPopover.contains(e.target) && e.target !== settingsBtn) {
      settingsPopover.classList.remove('active');
    }
    if (accountPopover && !accountPopover.contains(e.target) && !userProfileBtn.contains(e.target)) {
      accountPopover.classList.remove('active');
    }
  });
});