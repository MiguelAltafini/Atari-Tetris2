// audio.js - Retro 8-bit sound synthesizer using Web Audio API

const AudioSys = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if(AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if(this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    playTone(frequency, type, duration, vol=0.1) {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    move() {
        this.playTone(250, 'square', 0.05, 0.05);
    },

    rotate() {
        this.playTone(400, 'square', 0.08, 0.05);
    },

    drop() {
        this.playTone(150, 'sawtooth', 0.1, 0.05);
    },

    lock() {
        this.playTone(100, 'square', 0.1, 0.08);
    },

    clear() {
        // Quick arpeggio
        this.playTone(523.25, 'square', 0.1, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'square', 0.1, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'square', 0.2, 0.1), 200); // G5
        setTimeout(() => this.playTone(1046.50, 'square', 0.3, 0.1), 300); // C6
    },

    gameover() {
        this.playTone(300, 'sawtooth', 0.3, 0.2);
        setTimeout(() => this.playTone(250, 'sawtooth', 0.3, 0.2), 300);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.3, 0.2), 600);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.6, 0.2), 900);
    }
};
