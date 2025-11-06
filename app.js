// Sample refrigeration data
const refrigerationStates = [
    {
        id: 1,
        name: "Estado 1 - Salida Evaporador",
        temperature: undefined,
        enthalpy: undefined,
        entropy:undefined,
        phase: "Vapor Saturado",
        color: "#2196F3",
        component: "evaporador"
    },
    {
        id: 2,
        name: "Estado 2 - Salida Compresor",
        pressure: undefined,
        temperature: undefined,
        enthalpy: undefined,
        entropy: undefined,
        phase: "Vapor Sobrecalentado",
        color: "#F44336",
        component: "compresor"
    },
    {
        id: 3,
        name: "Estado 3 - Salida Condensador",
      pressure: undefined,
        temperature: undefined,
        enthalpy: undefined,
        entropy: undefined,
        phase: "Líquido Saturado",
        color: "#FF9800",
        component: "condensador"
    },
    {
        id: 4,
        name: "Estado 4 - Salida Válvula",
        pressure: undefined,
        temperature: undefined,
        enthalpy: undefined,
        entropy: undefined,
        phase: "Mezcla Bifásica",
        color: "#9C27B0",
        component: "valvula"
    }
];

// Application state
const appState = {
    lives: 3,
    simulationRunning: false,
    components: [],
    connections: [],
    currentCycle: 0,
    currentStep: 0,
    animationFrame: 0,
    particles: []
};

// Canvas setup
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    render();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Component class
class Component {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.connections = { in: null, out: null };
        this.animating = false;
        this.animationPhase = 0;
        
        // Define connection points
        this.setConnectionPoints();
    }
    
    setConnectionPoints() {
        switch(this.type) {
            case 'compressor':
                this.inPoint = { x: this.x - 40, y: this.y + 40 };
                this.outPoint = { x: this.x + this.width + 20, y: this.y - 20 };
                break;
            case 'condenser':
                this.inPoint = { x: this.x - 20, y: this.y - 20 };
                this.outPoint = { x: this.x + 20, y: this.y + this.height + 20 };
                break;
            case 'expansion':
                this.inPoint = { x: this.x - 20, y: this.y };
                this.outPoint = { x: this.x + this.width + 20, y: this.y };
                break;
            case 'evaporator':
                this.inPoint = { x: this.x + this.width + 20, y: this.y + 40 };
                this.outPoint = { x: this.x - 40, y: this.y + 40 };
                break;
        }
    }
    
    updateConnectionPoints() {
        this.setConnectionPoints();
    }
    
    draw(ctx) {
        this.drawComponent(ctx);
        this.drawConnectionPoints(ctx);
    }
    
    drawComponent(ctx) {
        ctx.save();
        
        // Component-specific drawing
        switch(this.type) {
            case 'compressor':
                this.drawCompressor(ctx);
                break;
            case 'condenser':
                this.drawCondenser(ctx);
                break;
            case 'expansion':
                this.drawExpansionValve(ctx);
                break;
            case 'evaporator':
                this.drawEvaporator(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    drawCompressor(ctx) {
        // Main body
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Motor top
        ctx.fillStyle = '#34495e';
        ctx.fillRect(this.x + 20, this.y - 30, this.width - 40, 30);
        
        // Pressure gauge
        ctx.beginPath();
        ctx.arc(this.x + this.width - 20, this.y + 30, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ecf0f1';
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Pipes
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        // Inlet
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 40);
        ctx.lineTo(this.x - 40, this.y + 40);
        ctx.stroke();
        
        // Outlet
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width + 20, this.y - 20);
        ctx.stroke();
        
        // Animation effect when running
        if (this.animating) {
            this.animationPhase += 0.1;
            const vibration = Math.sin(this.animationPhase) * 2;
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x + vibration, this.y + vibration, this.width, this.height);
        }
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('COMPRESOR', this.x + this.width/2, this.y + this.height/2 + 4);
    }
    
    drawCondenser(ctx) {
        // Main frame
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Copper coils
        ctx.strokeStyle = '#d68910';
        ctx.lineWidth = 4;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + 20 + i * 12);
            ctx.lineTo(this.x + this.width - 10, this.y + 20 + i * 12);
            ctx.stroke();
        }
        
        // Fins
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 15 + i * 10, this.y + 10);
            ctx.lineTo(this.x + 15 + i * 10, this.y + this.height - 10);
            ctx.stroke();
        }
        
        // Fan on top
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y - 15);
        if (this.animating) {
            this.animationPhase += 0.15;
            ctx.rotate(this.animationPhase);
        }
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(i * Math.PI/2) * 15, Math.sin(i * Math.PI/2) * 15);
            ctx.stroke();
        }
        ctx.restore();
        
        // Pipes
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - 20, this.y - 20);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y + this.height);
        ctx.lineTo(this.x + 20, this.y + this.height + 20);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CONDENSADOR', this.x + this.width/2, this.y + this.height - 10);
    }
    
    drawExpansionValve(ctx) {
        // Main valve body
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(this.x + 30, this.y - 10, 60, 40);
        
        // Brass texture
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 35, this.y + i * 10);
            ctx.lineTo(this.x + 85, this.y + i * 10);
            ctx.stroke();
        }
        
        // Sensing bulb
        ctx.fillStyle = '#cd853f';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y - 30, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Capillary tube
        ctx.strokeStyle = '#d2691e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y - 20);
        ctx.lineTo(this.x + this.width/2, this.y - 10);
        ctx.stroke();
        
        // Coil
        ctx.strokeStyle = '#d2691e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.arc(this.x + 60, this.y - 30 + i * 6, 8, 0, Math.PI);
        }
        ctx.stroke();
        
        // Connection pipes
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.x + 30, this.y);
        ctx.lineTo(this.x - 10, this.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 90, this.y);
        ctx.lineTo(this.x + this.width + 20, this.y);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EXPANSIÒN', this.x + this.width/2+15, this.y + 25);
    }
    
    drawEvaporator(ctx) {
        // Frame
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Copper tubes
        ctx.strokeStyle = '#d68910';
        ctx.lineWidth = 6;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + 20 + i * 15);
            ctx.lineTo(this.x + this.width - 10, this.y + 20 + i * 15);
            ctx.stroke();
        }
        
        // Aluminum fins
        ctx.fillStyle = '#bdc3c7';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(this.x + 15 + i * 8, this.y + 10, 2, this.height - 20);
        }
        
        // Frost effect when operating
        if (this.animating) {
            ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        }
        
        // Connection pipes
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + 40);
        ctx.lineTo(this.x + this.width + 20, this.y + 40);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 40);
        ctx.lineTo(this.x - 40, this.y + 40);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EVAPORADOR', this.x + this.width/2, this.y + this.height/2 + 4);
    }
    
    drawConnectionPoints(ctx) {
        // Input point
        ctx.beginPath();
        ctx.arc(this.inPoint.x, this.inPoint.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Output point
        ctx.beginPath();
        ctx.arc(this.outPoint.x, this.outPoint.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    isNearConnectionPoint(x, y, point) {
        const dx = x - point.x;
        const dy = y - point.y;
        return Math.sqrt(dx * dx + dy * dy) < 15;
    }
}

// Connection class
class Connection {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.particles = [];
        this.particleSpeed = 2;
    }
    
draw(ctx) {
    const start = this.from.component.outPoint;
    const end = this.to.component.inPoint;

    // Draw pipe with better visualization
    ctx.save();
    
    // Outer pipe (darker)
    ctx.strokeStyle = '#5d6d7e';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    
    // Smooth curved connection
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const controlX = midX + (start.y > end.y ? -50 : 50);
    const controlY = midY + (start.x > end.x ? -30 : 30);
    
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();
    
    // Inner pipe (lighter)
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();
    
    ctx.restore();

    // SOLO mostrar partículas si esta conexión está activa en la etapa actual
    if (appState.simulationRunning && this.shouldShowFlow()) {
        this.updateAndDrawParticles(ctx, start, end);
    }
}

    shouldShowFlow() {
    if (!appState.simulationRunning) return false;
    
    const currentTableStep = appState.currentStep % 4;
    const fromType = this.from.component.type;
    const toType = this.to.component.type;
    
    // Determinar qué conexión debe mostrar flujo según la etapa actual
    switch(currentTableStep) {
        case 0: // Animación: Válvula → Evaporador (líquido frío)
            return fromType === 'expansion' && toType === 'evaporator';
            
        case 1: // Animación: Evaporador → Compresor (gas frío)
            return fromType === 'evaporator' && toType === 'compressor';
            
        case 2: // Animación: Compresor → Condensador (gas caliente)
            return fromType === 'compressor' && toType === 'condenser';
            
        case 3: // Animación: Condensador → Válvula (líquido caliente)
            return fromType === 'condenser' && toType === 'expansion';
            
        default:
            return false;
    }
}

updateAndDrawParticles(ctx, start, end) {
    // Solo crear partículas si esta conexión debe mostrar flujo
    if (!this.shouldShowFlow()) {
        this.particles = []; // Limpiar partículas si no debe mostrar flujo
        return;
    }
    
    const currentState = this.getRefrigerantState();
    
    // Frecuencia diferente según el tipo (líquido más frecuente para continuidad)
    let creationFrequency;
    if (currentState === 'hot-liquid' || currentState === 'cold-liquid') {
        creationFrequency = 0.8; // MÁS frecuente para líquidos
    } else {
        creationFrequency = 0.05; // Menos frecuente para gases
    }
    
    const shouldCreateParticle = Math.random() < creationFrequency;
    if (shouldCreateParticle) {
        this.particles.push({
            progress: 0,
            type: currentState,
            speed: 0.8 + Math.random() * 0.4,
            size: 1 + Math.random() * 0.5,
            // Para líquidos, crear partículas más largas
            length: (currentState === 'hot-liquid' || currentState === 'cold-liquid') ? 25 + Math.random() * 10 : 6
        });
    }

    // Update and draw particles
    this.particles = this.particles.filter(particle => {
        particle.progress += particle.speed / 150;
        
        if (particle.progress > 1) {
            return false; // Remove particle
        }

        // Bézier curve calculation
        const t = particle.progress;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const controlX = midX + (start.y > end.y ? -50 : 50);
        const controlY = midY + (start.x > end.x ? -30 : 30);
        
        const x = Math.pow(1 - t, 2) * start.x + 
                  2 * (1 - t) * t * controlX + 
                  Math.pow(t, 2) * end.x;
                  
        const y = Math.pow(1 - t, 2) * start.y + 
                  2 * (1 - t) * t * controlY + 
                  Math.pow(t, 2) * end.y;

        this.drawParticle(ctx, x, y, particle.type, particle.length);
        return true;
    });
}

getRefrigerantState() {
    const currentTableStep = appState.currentStep % 4;
    
    // Estado del refrigerante según la etapa actual
    switch(currentTableStep) {
         case 0: // Animación: Válvula → Evaporador
            return 'cold-liquid'; // Líquido frío y de baja presión
            
        case 1: // Animación: Evaporador → Compresor  
            return 'cold-gas'; // Gas frío y de baja presión
            
        case 2: // Animación: Compresor → Condensador
            return 'hot-gas'; // Gas caliente y de alta presión
            
        case 3: // Animación: Condensador → Válvula
            return 'hot-liquid'; // Líquido caliente y de alta presión
            
        default:
            return 'neutral';
    }
}

drawParticle(ctx, x, y, type, length = 6) {
    ctx.save();
    
    const time = Date.now() * 0.003;
    
    switch(type) {
        case 'hot-gas':
            // Gas caliente - sin cambios
            ctx.fillStyle = '#e74c3c';
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 15;
            
            const hotGasSize = 6 + Math.sin(time * 2) * 2;
            
            for(let i = 0; i < 3; i++) {
                ctx.globalAlpha = 0.3 - (i * 0.1);
                ctx.beginPath();
                ctx.arc(x, y, hotGasSize + (i * 4), 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(x, y, hotGasSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            for(let i = 0; i < 2; i++) {
                ctx.beginPath();
                ctx.moveTo(x - 8, y + (i * 4) - 2);
                ctx.lineTo(x + 8, y + (i * 4) - 2 + Math.sin(time * 3) * 2);
                ctx.stroke();
            }
            break;
            
        case 'hot-liquid':
            // Líquido caliente - CONTINUO Y LARGO
            ctx.fillStyle = '#e67e22';
            ctx.shadowColor = '#e67e22';
            ctx.shadowBlur = 12;
            
            // Forma alargada y continua
            const liquidHeight = 10;
            
            // Dibujar como cápsula (rectángulo con extremos redondeados)
            ctx.beginPath();
            ctx.roundRect(x - length/2, y - liquidHeight/2, length, liquidHeight, liquidHeight/2);
            ctx.fill();
            
            // Efecto de flujo interno (línea central ondulante)
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(x - length/2 + 3, y);
            for(let i = 0; i < length - 6; i += 3) {
                const waveY = y + Math.sin((time * 2) + ((x + i) * 0.02)) * 2;
                ctx.lineTo(x - length/2 + 3 + i, waveY);
            }
            ctx.stroke();
            
            // Brillo superior
            ctx.fillStyle = '#f1c40f';
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.roundRect(x - length/2, y - liquidHeight/2, length, 3, 1.5);
            ctx.fill();
            break;
            
        case 'cold-liquid':
            // Líquido frío - CONTINUO Y LARGO
            ctx.fillStyle = '#3498db';
            ctx.shadowColor = '#3498db';
            ctx.shadowBlur = 12;
            
            const coldLiquidHeight = 10;
            
            // Forma alargada y continua
            ctx.beginPath();
            ctx.roundRect(x - length/2, y - coldLiquidHeight/2, length, coldLiquidHeight, coldLiquidHeight/2);
            ctx.fill();
            
            // Efecto cristalino interno (menos puntos, más esparcidos)
            ctx.fillStyle = '#5dade2';
            ctx.globalAlpha = 0.6;
            for(let i = 0; i < 2; i++) {
                const sparkleX = x - length/3 + (i * length/2) + Math.sin(time * 2 + i) * 3;
                const sparkleY = y + Math.cos(time * 1.5 + i) * 2;
                ctx.fillRect(sparkleX - 1, sparkleY - 1, 3, 3);
            }
            
            // Borde más claro
            ctx.strokeStyle = '#85c1e9';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.roundRect(x - length/2, y - coldLiquidHeight/2, length, coldLiquidHeight, coldLiquidHeight/2);
            ctx.stroke();
            break;
            
        case 'cold-gas':
            // Gas frío - sin cambios
            ctx.fillStyle = '#2196f3';
            ctx.shadowColor = '#2196f3';
            ctx.shadowBlur = 15;
            
            const coldGasSize = 6 + Math.sin(time * 1.5) * 1.5;
            
            for(let i = 0; i < 4; i++) {
                ctx.globalAlpha = 0.2 - (i * 0.05);
                ctx.beginPath();
                ctx.arc(x, y, coldGasSize + (i * 3), 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(x, y, coldGasSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#85c1e9';
            ctx.globalAlpha = 0.7;
            for(let i = 0; i < 2; i++) {
                const iceX = x + Math.cos(time + i * Math.PI) * 8;
                const iceY = y + Math.sin(time + i * Math.PI) * 8;
                ctx.fillRect(iceX - 1, iceY - 1, 2, 2);
            }
            break;
    }
    
    ctx.restore();
}


    getTooltipText() {
        const state = this.getRefrigerantState();
        switch(state) {
            case 'hot-gas': return 'GAS CALIENTE';
            case 'hot-liquid': return 'LÍQUIDO CALIENTE';
            case 'cold-liquid': return 'LÍQUIDO FRÍO';
            case 'cold-gas': return 'GAS FRÍO';
            default: return 'REFRIGERANTE';
        }
    }
}

// Drag and drop functionality
let draggedComponent = null;
let dragOffset = { x: 0, y: 0 };
let connectingFrom = null;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a component
    for (let i = appState.components.length - 1; i >= 0; i--) {
        const comp = appState.components[i];
        if (comp.contains(x, y)) {
            draggedComponent = comp;
            dragOffset.x = x - comp.x;
            dragOffset.y = y - comp.y;
            return;
        }
        
        // Check if clicking on a connection point
        if (comp.isNearConnectionPoint(x, y, comp.outPoint)) {
            connectingFrom = { component: comp, point: 'out' };
            return;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggedComponent) {
        draggedComponent.x = x - dragOffset.x;
        draggedComponent.y = y - dragOffset.y;
        draggedComponent.updateConnectionPoints();
        render();
    }
    
    // Update tooltip
    updateTooltip(x, y);
});

canvas.addEventListener('mouseup', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (connectingFrom) {
        // Try to make a connection
        for (const comp of appState.components) {
            if (comp !== connectingFrom.component &&
                comp.isNearConnectionPoint(x, y, comp.inPoint)) {
                attemptConnection(connectingFrom.component, comp);
                break;
            }
        }
        connectingFrom = null;
    }
    
    draggedComponent = null;
    render();
});

// Palette drag and drop
const paletteItems = document.querySelectorAll('.palette-item');

paletteItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('componentType', item.dataset.component);
    });
});

canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 60;
    
    // Check if we already have 4 components
    const typeCounts = {};
    appState.components.forEach(c => {
        typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });
    
    if (typeCounts[componentType] >= 1) {
        alert('Solo puedes agregar un componente de cada tipo.');
        return;
    }
    
    const component = new Component(componentType, x, y);
    appState.components.push(component);
    render();
});

// Connection logic
function attemptConnection(fromComp, toComp) {
    // Define correct connection order
    const correctOrder = {
        'compressor': 'condenser',
        'condenser': 'expansion',
        'expansion': 'evaporator',
        'evaporator': 'compressor'
    };
    
    // Check if connection is correct
    if (correctOrder[fromComp.type] === toComp.type) {
        // Check if connection already exists
        const exists = appState.connections.some(c => 
            c.from.component === fromComp && c.to.component === toComp
        );
        
        if (!exists) {
            const connection = new Connection(
                { component: fromComp, point: 'out' },
                { component: toComp, point: 'in' }
            );
            appState.connections.push(connection);
            fromComp.connections.out = toComp;
            toComp.connections.in = fromComp;
            
            // Success feedback
            showNotification('✓ Conexión correcta', 'success');
        }
    } else {
        // Incorrect connection - lose a life
        appState.lives--;
        updateLivesDisplay();
        showNotification('✗ Conexión incorrecta - Vida perdida', 'error');
        
        if (appState.lives <= 0) {
            gameOver();
        }
    }
    
    render();
}

function updateLivesDisplay() {
    document.getElementById('livesCount').textContent = `${appState.lives}/3`;
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index < appState.lives) {
            heart.classList.add('active');
        } else {
            heart.classList.remove('active');
        }
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function gameOver() {
    appState.simulationRunning = false;
    alert('¡Game Over! Has perdido todas tus vidas. Reinicia para intentar de nuevo.');
    document.getElementById('startBtn').disabled = true;
}

// Tooltip
// Enhanced tooltip function with API data
// Enhanced tooltip function with API data
function updateTooltip(x, y) {
    const tooltip = document.getElementById('tooltip');
    let found = false;
    
    // Check components for tooltips
    for (const comp of appState.components) {
        if (comp.contains(x, y)) {
            const tooltipContent = getComponentTooltipContent(comp.type);
            if (tooltipContent) {
                tooltip.innerHTML = tooltipContent;
                tooltip.style.left = (x + 15) + 'px';
                tooltip.style.top = (y - 10) + 'px';
                tooltip.classList.add('show');
                found = true;
                break;
            }
        }
    }
    
    // If not hovering over component, check connections
    if (!found) {
        for (const conn of appState.connections) {
            const start = conn.from.component.outPoint;
            const end = conn.to.component.inPoint;
            
            // Simple distance check to connection line
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const dist = Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2));
            
            if (dist < 50) {
                tooltip.innerHTML = `<div class="tooltip-title">${conn.getTooltipText()}</div>`;
                tooltip.style.left = (x + 10) + 'px';
                tooltip.style.top = (y + 10) + 'px';
                tooltip.classList.add('show');
                found = true;
                break;
            }
        }
    }
    
    if (!found) {
        tooltip.classList.remove('show');
    }
}




// Function to get component-specific tooltip content - only API data
function getComponentTooltipContent(componentType) {
    // Only show tooltips if simulation is running and we have API data
    if (!appState.simulationRunning ) {
        return null;
    }
    const results = appState.simulationResults;
    
    switch (componentType) {
        case 'evaporator':
            return `
                <div class="tooltip-title">EVAPORADOR</div>
                <div class="tooltip-data">
                    <div class="tooltip-row">
                        <span class="tooltip-label">Calor Absorbido:</span>
                        <span class="tooltip-value">${results.qEvaporador?.toFixed(2) || 'N/A'} <span class="tooltip-unit">kW</span></span>
                    </div>
                </div>
            `;
            
        case 'compressor':
            return `
                <div class="tooltip-title">COMPRESOR</div>
                <div class="tooltip-data">
                    <div class="tooltip-row">
                        <span class="tooltip-label">Trabajo Compresor:</span>
                        <span class="tooltip-value">${results.trabajoCompresor?.toFixed(2) || 'N/A'} <span class="tooltip-unit">kW</span></span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">COP:</span>
                        <span class="tooltip-value">${results.cop?.toFixed(2) || 'N/A'}</span>
                    </div>
                </div>
            `;
            
        case 'condenser':
            return `
                <div class="tooltip-title">CONDENSADOR</div>
                <div class="tooltip-data">
                    <div class="tooltip-row">
                        <span class="tooltip-label">Calor Rechazado:</span>
                        <span class="tooltip-value">${results.qCondensador?.toFixed(2) || 'N/A'} <span class="tooltip-unit">kW</span></span>
                    </div>
                </div>
            `;
            
        case 'expansion':
            // No specific API data for expansion valve, return null
            return null;
            
        default:
            return null;
    }
}


// Default tooltip content when no API data is available


// Button handlers
document.getElementById('startBtn').addEventListener('click', startSimulation);
document.getElementById('stopBtn').addEventListener('click', stopSimulation);
document.getElementById('resetBtn').addEventListener('click', resetSimulation);
document.getElementById('educationalBtn').addEventListener('click', toggleEducationalModal);

function startSimulation() {
    document.getElementById('dataTableBody').innerHTML = '';
    // Check if data is configured FIRST
    if (!appState.dataConfigured) {
        alert('Primero debes configurar los datos usando el botón "Configurar Datos".');
        return;
    }

    // Check if already running
    if (appState.simulationRunning) {
        return; // Ya está simulando
    }

    // Check if all 4 components are connected in a cycle
    if (appState.components.length !== 4) {
        alert('Debes agregar los 4 componentes al tablero.');
        return;
    }
    
    if (appState.connections.length !== 4) {
        alert('Debes conectar todos los componentes en el orden correcto.');
        return;
    }
    
    // Verify complete cycle
    if (!isCompleteCycle()) {
        alert('El ciclo no está completo. Verifica las conexiones.');
        return;
    }

    // Start visual simulation
    appState.simulationRunning = true;
    appState.currentStep = 0;
    appState.currentCycle = 0;
    
    // Update button states
    updateButtonStates();

    // Enable animation on all components
    appState.components.forEach(c => c.animating = true);

    // Start animation loop
    animate();

    // Start data table updates
    updateDataTable();
}


// Function to update refrigerationStates with API data
function updateRefrigerationStatesFromAPI(apiData) {
    console.log('API Data received:', apiData);
    
    if (!apiData || !apiData.states || apiData.states.length === 0) {
        console.error('No API states received');
        return;
    }
    
    // Update refrigerationStates with API data
    for (let i = 0; i < Math.min(apiData.states.length, 4); i++) {
        const apiState = apiData.states[i];
        
        if (refrigerationStates[i] && apiState) {
            refrigerationStates[i].pressure = apiState.pressure;
            refrigerationStates[i].temperature = apiState.temperature;
            refrigerationStates[i].enthalpy = apiState.enthalpy;
            refrigerationStates[i].entropy = apiState.entropy;
            refrigerationStates[i].specificVolume = apiState.specificVolume;
        }
    }
    
    // Store additional simulation results
    appState.simulationResults = {
        cop: apiData.cop,
        qEvaporador: apiData.qEvaporador,
        qCondensador: apiData.qCondensador,
        trabajoCompresor: apiData.trabajoCompresor,
        message: apiData.message || "Simulación completada"
    };
    
    console.log('Estados actualizados correctamente para configuración');
}


function stopSimulation() {
    appState.simulationRunning = false;
    
    updateButtonStates();
    
    appState.components.forEach(c => c.animating = false);
    
    
}


function resetSimulation() {
    stopSimulation();
    appState.components = [];
    appState.connections = [];
    appState.lives = 3;
    appState.currentCycle = 0;
    appState.currentStep = 0;
    updateLivesDisplay();
    document.getElementById('dataTableBody').innerHTML = '';
    document.getElementById('cycleCounter').textContent = 'Ciclo: 0';
    document.getElementById('startBtn').disabled = false;
    render();
}

function isCompleteCycle() {
    if (appState.components.length !== 4 || appState.connections.length !== 4) {
        return false;
    }
    
    // Find compressor and trace the cycle
    const compressor = appState.components.find(c => c.type === 'compressor');
    if (!compressor || !compressor.connections.out) return false;
    
    let current = compressor.connections.out;
    const visited = new Set([compressor.type]);
    
    while (current && !visited.has(current.type)) {
        visited.add(current.type);
        current = current.connections.out;
    }
    
    return visited.size === 4 && current === compressor;
}

function toggleEducationalModal() {
    const modal = document.getElementById('educationalModal');
    modal.classList.toggle('show');
}

// Modal close button
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('educationalModal').classList.remove('show');
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('educationalModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Data table updates
let dataTableInterval;

function updateDataTable() {
    if (!appState.simulationRunning) return;
    
    const tableBody = document.getElementById('dataTableBody');
    let currentIndex = appState.currentStep % 4;
    const state = refrigerationStates[currentIndex];
    
    if (!state || typeof state.pressure !== 'number' || isNaN(state.pressure)) {
        console.log('Estado no válido, saltando...');
        appState.currentStep++;
        setTimeout(updateDataTable, 100);
        return;
    }
    
    // RESETEAR todas las partículas para nueva etapa
    appState.connections.forEach(conn => {
        conn.particles = [];
    });
    
    console.log(`=== ETAPA ${currentIndex + 1} ===`);
    console.log('Estado actual:', state.name);
    console.log('Conexión activa:', getActiveConnectionDescription(currentIndex));
    
    // Add row to table
    const row = document.createElement('tr');
    row.classList.add('highlight');
    row.innerHTML = `
        <td><strong>${state.name}</strong></td>
        <td>${state.pressure.toFixed(2)}</td>
        <td>${state.temperature.toFixed(2)}</td>
        <td>${state.enthalpy.toFixed(2)}</td>
        <td>${state.entropy.toFixed(4)}</td>
        <td><span class="phase-badge">${state.phase || 'N/A'}</span></td>
        <td>
            <span class="state-indicator">
                <span class="state-dot" style="background: ${state.color}"></span>
                ${getStateText(state.component)}
            </span>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Scroll to bottom
    const container = document.querySelector('.table-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
    
    appState.currentStep++;
    
    // Reset table after complete cycle
    if (appState.currentStep % 4 === 0) {
        appState.currentCycle++;
        const cycleCounter = document.getElementById('cycleCounter');
        if (cycleCounter) {
            cycleCounter.textContent = `Ciclo ${appState.currentCycle}`;
        }
        setTimeout(() => {
            tableBody.innerHTML = '';
        }, 2000);
    }
    
    // Schedule next update - 4 segundos por etapa
    setTimeout(updateDataTable, 4000);
}
function getActiveConnectionDescription(step) {
    switch(step) {
        case 0: return 'Evaporador → Compresor (Gas frío)';
        case 1: return 'Compresor → Condensador (Gas caliente)';  
        case 2: return 'Condensador → Válvula (Líquido caliente)';
        case 3: return 'Válvula → Evaporador (Líquido frío)';
        default: return 'N/A';
    }
}


function getStateText(component) {
    switch(component) {
        case 'evaporador': return 'Gas Frío';
        case 'compresor': return 'Gas Caliente';
        case 'condensador': return 'Líquido Caliente';
        case 'valvula': return 'Líquido Frío';
        default: return 'Refrigerante';
    }
}

// Animation loop
function animate() {
    if (!appState.simulationRunning) return;
    
    render();
    requestAnimationFrame(animate);
}

// Render function
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections first
    appState.connections.forEach(conn => conn.draw(ctx));
    
    // Draw components
    appState.components.forEach(comp => comp.draw(ctx));
}

// Initial render
render();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translate(-50%, 0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Function to configure simulation data from API
async function configureSimulationData() {
    // No permitir configuración durante simulación
    if (appState.simulationRunning) {
        alert('No puedes cambiar la configuración mientras se está simulando.');
        return;
    }
    
    const refrigerant = document.getElementById('refrigerantSelect').value;
    const evapTemp = parseFloat(document.getElementById('evapTemp').value);
    const condTemp = parseFloat(document.getElementById('condTemp').value);
    
    // Validate inputs
    if (isNaN(evapTemp) || isNaN(condTemp)) {
        alert('Por favor ingresa valores numéricos válidos para las temperaturas.');
        return;
    }
    
    if (evapTemp >= condTemp) {
        alert('La temperatura de evaporación debe ser menor que la de condensación.');
        return;
    }

    const requestBody = {
        refrigerant: refrigerant,
        TEvap: evapTemp,
        TCond: condTemp
    };

    try {
        // Show loading state
        const configBtn = document.getElementById('configBtn');
        const startBtn = document.getElementById('startBtn');
        
        // Diferentes textos según si es primera configuración o reconfiguración
        const isReconfiguring = appState.dataConfigured;
        configBtn.textContent = isReconfiguring ? 'Reconfigurando...' : 'Configurando...';
        configBtn.className = 'btn btn--secondary loading';
        configBtn.disabled = true;
        
        startBtn.disabled = true;
        startBtn.textContent = 'Esperando configuración...';

        const response = await fetch('https://snow-back-dmcdbtdzc8adhya9.eastus2-01.azurewebsites.net/api/Simulation/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Update refrigerationStates with API response
        updateRefrigerationStatesFromAPI(data);

        // Mark as configured
        appState.dataConfigured = true;

        // Update button states
        updateButtonStates();

        // Show appropriate success message
        const message = isReconfiguring ? 
            '✓ Datos reconfigurados exitosamente. Puedes iniciar la simulación con los nuevos valores.' :
            '✓ Datos configurados exitosamente. Ya puedes iniciar la simulación.';
        
        showNotification(message, 'success');

    } catch (error) {
        console.error('Error en la configuración:', error);
        const message = appState.dataConfigured ? 
            '✗ Error en reconfiguración: ' + error.message :
            '✗ Error en configuración: ' + error.message;
        
        showNotification(message, 'error');
        
        // Si era una reconfiguración fallida, mantener el estado configurado
        // Si era la primera configuración, marcar como no configurado
        if (!appState.dataConfigured) {
            appState.dataConfigured = false;
        }
        
        // Update button states
        updateButtonStates();
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Initialize app state flags
    appState.dataConfigured = false;
    appState.simulationRunning = false;

    // Add event listeners
    const configBtn = document.getElementById('configBtn');
    if (configBtn) {
        configBtn.addEventListener('click', configureSimulationData);
    }

    // Update initial button states
    updateButtonStates();
    
    console.log('App initialized successfully');
});

// Function to update button states based on app state
function updateButtonStates() {
    const configBtn = document.getElementById('configBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    if (!configBtn || !startBtn || !stopBtn) return;
    
    if (appState.simulationRunning) {
        // Durante simulación - NO permitir reconfiguración
        configBtn.disabled = true;
        configBtn.textContent = 'Simulación en curso';
        configBtn.className = 'btn btn--secondary';
        
        startBtn.disabled = true;
        startBtn.textContent = 'Simulando...';
        
        stopBtn.disabled = false;
        
    } else if (appState.dataConfigured) {
        // Datos configurados, no simulando - PERMITIR reconfiguración
        configBtn.disabled = false;
        configBtn.textContent = 'Reconfigurar Datos';  // Cambiar texto
        configBtn.className = 'btn btn--secondary success';
        
        startBtn.disabled = false;
        startBtn.textContent = 'Iniciar Simulación';
        
        stopBtn.disabled = true;
        
    } else {
        // Estado inicial - sin datos configurados
        configBtn.disabled = false;
        configBtn.textContent = 'Configurar Datos';
        configBtn.className = 'btn btn--secondary';
        
        startBtn.disabled = true;
        startBtn.textContent = 'Datos no configurados';
        
        stopBtn.disabled = true;
    }
}


// Agregar esta función si roundRect no está disponible en tu navegador
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}
