
Polymer({

  created() {
    this.model = {
      voice: [
        {
          type: 'Oscillator',
          params: {
            type: 'sine',
            mode: 'mix',
            freq: {
              detune: -1200,
              lfo: { freq: 4, amount: 0 }
            },
            gain: {
              volume: 1,
              adsr: { a: 0, d: 0.3, s: 1, r: 1 }
            },
            pan: { value: 0 }
          }
        },
        {
          type: 'Oscillator',
          params: {
            type: 'sine',
            mode: 'fm',
            fm: { amount: 500 },
            freq: {
              detune: 0,
              lfo: { freq: 4, amount: 0 }
            },
            gain: {
              volume: 1,
              adsr: { a: 0, d: 0.3, s: 0.6, r: 0.2 }
            },
            pan: { value: 0 }
          }
        }
      ]
    }
    let saw = (detune, gain) => ({
          type: 'Oscillator',
          params: {
            type: 'sawtooth',
            mode: 'mix',
            fm: { amount: 500 },
            freq: {
              detune: detune,
              lfo: { freq: 4, amount: 0 }
            },
            gain: {
              volume: gain,
              adsr: { a: 0.001, d: 0.5, s: 0.7, r: 0.11 }
            },
            pan: { value: 0 }
          }
        })
    this.model = {
      voice: [
        saw(0, 0.2),
        saw(20, 0.2),
        saw(-20, 0.2),
        saw(-1220, 0.1),
        saw(-1200, 0.1),
        saw(-1180, 0.1),
        saw(-2400, 0.1),
      ]
    }
  },

  ready() {
    this._listenKeyboard(this.$.kb1, 72)
    this._listenKeyboard(this.$.kb2, 60)
  },

  _listenKeyboard(keyboard, base) {
    keyboard.addEventListener('noteon', (e) => {
      this.$.notes.noteOn(base + e.detail, 127)
    })
    keyboard.addEventListener('noteoff', (e) => {
      this.$.notes.noteOff(base + e.detail)
    })
  },

})







