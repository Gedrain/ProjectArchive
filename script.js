// =========================================
// ИНТЕРАКТИВНАЯ ФОНОВАЯ MESH-СЕТЬ (АВТОЗАПУСК)
// =========================================

const canvas = document.getElementById('home-canvas');
const ctx = canvas.getContext('2d');

let nodes = [];
let packets = [];
let mouse = { x: null, y: null, radius: 200 };

// Настройка Canvas под размер окна
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Отслеживание мыши
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Инициализация узлов
function initNetwork() {
    nodes = [];
    let numNodes = Math.floor((canvas.width * canvas.height) / 25000); // Плотность узлов
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            baseRadius: Math.random() * 2 + 2,
            id: i
        });
    }
}

// Создание пакета данных (точка, бегущая по линии)
function spawnPacket(startNode, endNode) {
    packets.push({
        x: startNode.x,
        y: startNode.y,
        target: endNode,
        speed: 0.05, // Процент пути за кадр
        progress: 0
    });
}

// Главный цикл анимации
function animateNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Обновление и отрисовка линий
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
        let n1 = nodes[i];
        
        // Взаимодействие с мышью (притяжение)
        if (mouse.x != null) {
            let dxMouse = mouse.x - n1.x;
            let dyMouse = mouse.y - n1.y;
            let distMouse = Math.hypot(dxMouse, dyMouse);
            if (distMouse < mouse.radius) {
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(178, 67, 56, ${1 - distMouse/mouse.radius})`; // Красная линия к мыши
                ctx.stroke();
                
                // Легкое притяжение к курсору
                n1.x += dxMouse * 0.01;
                n1.y += dyMouse * 0.01;
            }
        }

        // Движение узла
        n1.x += n1.vx;
        n1.y += n1.vy;

        // Отскок от краев
        if (n1.x < 0 || n1.x > canvas.width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > canvas.height) n1.vy *= -1;

        // Линии между узлами
        let connectedNeighbors = [];
        for (let j = i + 1; j < nodes.length; j++) {
            let n2 = nodes[j];
            let dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

            if (dist < 180) {
                connectedNeighbors.push(n2);
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                let opacity = 1 - (dist / 180);
                ctx.strokeStyle = `rgba(75, 73, 64, ${opacity * 0.4})`; // Темно-серые линии
                ctx.stroke();
            }
        }
        
        // Случайный запуск пакета данных
        if (connectedNeighbors.length > 0 && Math.random() < 0.005) {
            let randomTarget = connectedNeighbors[Math.floor(Math.random() * connectedNeighbors.length)];
            spawnPacket(n1, randomTarget);
        }
    }

    // 2. Отрисовка пакетов данных (красные бегущие точки)
    for (let i = packets.length - 1; i >= 0; i--) {
        let p = packets[i];
        p.progress += p.speed;
        
        if (p.progress >= 1) {
            packets.splice(i, 1); // Пакет достиг цели
            continue;
        }
        
        // Интерполяция позиции
        p.x = p.x + (p.target.x - p.x) * p.speed;
        p.y = p.y + (p.target.y - p.y) * p.speed;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#b24338'; // Фирменный красный
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#b24338';
        ctx.fill();
        ctx.shadowBlur = 0; // Сброс тени
    }

    // 3. Отрисовка самих узлов
    nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#4b4940';
        ctx.fill();
    });

    requestAnimationFrame(animateNetwork);
}

// Запуск
initNetwork();
animateNetwork();