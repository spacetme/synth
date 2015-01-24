
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
              adsr: { a: 0, d: 0.3, s: 0.6, r: 0.2 }
            },
            pan: { value: 0 }
          }
        }
      ]
    }
  },

  ready() {
    this._listenKeyboard(this.$.kb1, 84)
    this._listenKeyboard(this.$.kb2, 72)
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







