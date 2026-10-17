// Clock update
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}, 1000);

// Default window positions & offsets for cascading initial open
let openWindowCount = 0;

function openWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;

    win.style.display = 'flex';
    win.classList.remove('minimized');
    
    // Auto-adjust layout based on screen width
    const isMobile = window.innerWidth <= 600;
    const isTablet = window.innerWidth <= 900;

    if (isMobile) {
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 74px)';
        win.style.top = '32px';
        win.style.left = '0';
    } else if (isTablet) {
        win.style.width = '94vw';
        win.style.height = 'calc(100vh - 85px)';
        win.style.top = '36px';
        win.style.left = '3vw';
    } else {
        // Desktop window initial size & cascade positioning if not already custom set
        if (!win.dataset.positioned) {
            const offset = (openWindowCount % 6) * 25;
            win.style.top = (40 + offset) + 'px';
            win.style.left = Math.min(80 + offset, window.innerWidth - 970) + 'px';
            win.dataset.positioned = "true";
            openWindowCount++;
        }
    }

    bringToFront(windowId);
    updateTaskbar();
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        win.style.display = 'none';
        updateTaskbar();
    }
}

function minimizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        win.classList.add('minimized');
        updateTaskbar();
    }
}

function maximizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;

    const isMobile = window.innerWidth <= 600;
    
    // On mobile, windows are always full size
    if (isMobile) return;

    if (win.classList.contains('maximized')) {
        win.classList.remove('maximized');
        win.style.width = 'min(920px, 92vw)';
        win.style.height = 'min(650px, calc(100vh - 90px))';
        win.style.top = win.dataset.prevTop || '40px';
        win.style.left = win.dataset.prevLeft || '80px';
        win.style.borderRadius = '8px';
    } else {
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.classList.add('maximized');
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 72px)';
        win.style.top = '32px';
        win.style.left = '0';
        win.style.borderRadius = '0';
    }
}

function bringToFront(windowId) {
    const windows = document.querySelectorAll('.os-window');
    windows.forEach(w => w.style.zIndex = '10');
    const target = document.getElementById(windowId);
    if (target) {
        target.style.zIndex = '100';
    }
}

// Support single tap/click on desktop icons for touch/mobile devices
let lastClickTime = 0;
function handleIconClick(event, windowId) {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    // On mobile screens or fast touch taps, open on single tap
    if (window.innerWidth <= 768 || (timeDiff < 400 && timeDiff > 0)) {
        openWindow(windowId);
    }
    lastClickTime = currentTime;
}

// Window Dragging Logic (Mouse)
function dragWindow(e, windowId) {
    // Disable dragging on mobile devices where window is fullscreen
    if (window.innerWidth <= 600) return;
    
    const win = document.getElementById(windowId);
    if (win.classList.contains('maximized')) return;

    bringToFront(windowId);
    let startX = e.clientX;
    let startY = e.clientY;

    function onMouseMove(e) {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;

        let newTop = win.offsetTop + dy;
        let newLeft = win.offsetLeft + dx;

        // Keep window within top bar boundaries
        if (newTop < 32) newTop = 32;

        win.style.top = newTop + 'px';
        win.style.left = newLeft + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Touch Dragging Logic for Tablets
function dragWindowTouch(e, windowId) {
    if (window.innerWidth <= 600) return;
    
    const win = document.getElementById(windowId);
    if (win.classList.contains('maximized')) return;

    bringToFront(windowId);
    const touch = e.touches[0];
    let startX = touch.clientX;
    let startY = touch.clientY;

    function onTouchMove(e) {
        const touchMove = e.touches[0];
        let dx = touchMove.clientX - startX;
        let dy = touchMove.clientY - startY;
        startX = touchMove.clientX;
        startY = touchMove.clientY;

        let newTop = win.offsetTop + dy;
        let newLeft = win.offsetLeft + dx;

        if (newTop < 32) newTop = 32;

        win.style.top = newTop + 'px';
        win.style.left = newLeft + 'px';
    }

    function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
}

function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = '';
    const windows = document.querySelectorAll('.os-window');
    windows.forEach(w => {
        if (w.style.display === 'flex' && !w.classList.contains('minimized')) {
            const title = w.querySelector('.window-title').innerText;
            const chip = document.createElement('div');
            chip.className = 'taskbar-app-chip';
            chip.innerText = title;
            chip.onclick = () => bringToFront(w.id);
            taskbarApps.appendChild(chip);
        }
    });
}

function toggleStartMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.taskbar-start');
    if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && !startBtn.contains(e.target)) {
            menu.classList.add('hidden');
        }
    }
});

// Terminal Logic
function focusTerminalInput() {
    const input = document.getElementById('terminal-input');
    if (input) input.focus();
}

function handleTerminalCommand(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const cmd = input.value.trim().toLowerCase();

        output.innerHTML += `visitor@sheraz-os:~$ ${input.value}<br>`;

        if (cmd === 'help') {
            output.innerHTML += `Available commands:<br>
            - <span class="highlight">about</span>: View professional summary<br>
            - <span class="highlight">experience</span>: List professional experience<br>
            - <span class="highlight">skills</span>: List core competencies & technical skills<br>
            - <span class="highlight">contact</span>: Show contact details<br>
            - <span class="highlight">clear</span>: Clear terminal screen<br><br>`;
        } else if (cmd === 'about') {
            output.innerHTML += `Sheraz Khan: IT Manager, Cybersecurity Specialist & Automation Expert with 15+ years experience.<br><br>`;
        } else if (cmd === 'experience') {
            output.innerHTML += `1. IT Manager | Drake Lighting (2022-2026)<br>2. IT Systems Manager | Native Grill & Wings (2019-2022)<br>3. IT Systems Manager | TravelCenters of America (2012-2019)<br><br>`;
        } else if (cmd === 'skills') {
            output.innerHTML += `Azure, M365, Entra ID, Power Platform, Dynamics 365, Cybersecurity, Zero Trust, Python, C#, SQL.<br><br>`;
        } else if (cmd === 'contact') {
            output.innerHTML += `Email: sherazkhanonline@outlook.com | Phone: (217) 904-2042 | Web: sherazkhanonline.com<br><br>`;
        } else if (cmd === 'clear') {
            output.innerHTML = `Welcome to SherazOS v10.4<br>Type <span class="highlight">help</span> for commands.<br><br>`;
        } else if (cmd !== '') {
            output.innerHTML += `Command not recognized: ${cmd}. Type <span class="highlight">help</span> for available commands.<br><br>`;
        }

        input.value = '';
        const body = document.querySelector('.terminal-body');
        body.scrollTop = body.scrollHeight;
    }
}

// Window resize handler for dynamic viewport updates
window.addEventListener('resize', () => {
    const activeWindows = document.querySelectorAll('.os-window');
    activeWindows.forEach(win => {
        if (win.style.display === 'flex') {
            if (window.innerWidth <= 600) {
                win.style.width = '100vw';
                win.style.height = 'calc(100vh - 74px)';
                win.style.top = '32px';
                win.style.left = '0';
            }
        }
    });
});

// Ensure ONLY About Me window is open on startup
window.onload = () => {
    const windows = document.querySelectorAll('.os-window');
    windows.forEach(w => w.style.display = 'none');
    openWindow('about-window');
};
