// Clock update
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}, 1000);

function openWindow(windowId) {
    const win = document.getElementById(windowId);
    win.style.display = 'flex';
    win.classList.remove('minimized');
    bringToFront(windowId);
    updateTaskbar();
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId);
    win.style.display = 'none';
    updateTaskbar();
}

function minimizeWindow(windowId) {
    const win = document.getElementById(windowId);
    win.classList.add('minimized');
    updateTaskbar();
}

function maximizeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win.style.width === '100vw') {
        win.style.width = '950px';
        win.style.height = '700px';
        win.style.top = '40px';
        win.style.left = '80px';
    } else {
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 70px)';
        win.style.top = '30px';
        win.style.left = '0';
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

// Window Dragging Logic
function dragWindow(e, windowId) {
    const win = document.getElementById(windowId);
    bringToFront(windowId);
    let startX = e.clientX;
    let startY = e.clientY;

    function onMouseMove(e) {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        win.style.top = (win.offsetTop + dy) + 'px';
        win.style.left = (win.offsetLeft + dx) + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
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

function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
}

// Terminal Logic
function focusTerminalInput() {
    document.getElementById('terminal-input').focus();
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

// Ensure ONLY About Me window is open on startup
window.onload = () => {
    const windows = document.querySelectorAll('.os-window');
    windows.forEach(w => w.style.display = 'none');
    openWindow('about-window');
};
