
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
        {
          type: 'BiquadFilter',
          params: {
            type: 'lowpass',
            freq: {
              lfo: { freq: 4, amount: 0 },
              auto: { i: 0, a: 0, p: 20000, d: 0.1, s: 2000 }
            },
            q: {
              lfo: { freq: 4, amount: 0 },
              auto: { i: 1, a: 0, p: 1, d: 0.5, s: 1 }
            },
          }
        },
      ]
    }
  },

  ready() {
    this._listenKeyboard(this.$.kb1, 60)
    this._listenKeyboard(this.$.kb2, 60 - 12)
    this._listenPCKeyboard([81,50,87,51,69,82,53,84,54,89,55,85,73,57,79,48,80,219,187,221], 60)
    this._listenPCKeyboard([90,83,88,68,67,86,71,66,72,78,74,77,188,76,190,186,191], 60 - 12)
  },

  _listenKeyboard(keyboard, base) {
    keyboard.addEventListener('noteon', (e) => {
      this.$.notes.noteOn(base + e.detail, 127)
    })
    keyboard.addEventListener('noteoff', (e) => {
      this.$.notes.noteOff(base + e.detail)
    })
  },

  _listenPCKeyboard(keymap, base) {
    let notes = { }
    window.addEventListener('keydown', (e) => {
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return
      let index = keymap.indexOf(e.which)
      if (index === -1) return
      if (notes[index]) return
      console.log('note on ' + index)
      notes[index] = true
      this.$.notes.noteOn(base + index, 127)
      e.preventDefault()
    })
    window.addEventListener('keyup', (e) => {
      let index = keymap.indexOf(e.which)
      if (index === -1) return
      if (!notes[index]) return
      console.log('note off ' + index)
      notes[index] = false
      this.$.notes.noteOff(base + index)
      e.preventDefault()
    })
  },

})







