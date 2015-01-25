
let PRESETS = [
  {
    name: 'Simple',
    voice: [
      {
        type: 'Oscillator',
        params: {
          type: 'square',
          mode: 'mix',
          freq: {
            detune: 1200,
            lfo: { freq: 4, amount: 0 }
          },
          gain: {
            volume: 1,
            adsr: { a: 0, d: 0.3, s: 0.5, r: 1 }
          },
          pan: { value: 0 }
        }
      },
      {
        type: 'Oscillator',
        params: {
          type: 'sine',
          mode: 'fm',
          fm: { amount: 750 },
          freq: {
            detune: 0,
            lfo: { freq: 4, amount: 0 }
          },
          gain: {
            volume: 1,
            adsr: { a: 0, d: 0.35, s: 0.6, r: 0.25 }
          },
          pan: { value: 0 }
        }
      }
    ]
  },
  {
    name: 'Supersaw Pluck',
    voice: (function() {
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
      return [
        saw(0, 0.3),
        saw(12, 0.2),
        saw(-12, 0.2),
        saw(32, 0.1),
        saw(-32, 0.1),
        saw(-1216, 0.05),
        saw(-1184, 0.05),
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
    }())
  }
]

Polymer({

  created() {
    this.model = {
    }
    this.model.note = {
      transpose: 0,
      octave: 0,
    }
    this.model.voice = PRESETS[0].voice
  },

  eventDelegates: {
    modelchanged: 'handleModelChange',
    unitremove: 'handleUnitRemove',
    unitduplicate: 'handleUnitDuplicate',
  },

  handleModelChange() {
    this.$.synth.compile()
  },

  handleUnitRemove(e, index) {
    this.model.voice.splice(index, 1)
    this.fire('modelchanged')
  },

  handleUnitDuplicate(e, index) {
    this.model.voice.splice(index + 1, 0, R.cloneDeep(this.model.voice[index]))
    this.fire('modelchanged')
  },

  ready() {
    this._listenKeyboard(this.$.kb1)
    this._listenKeyboard(this.$.kb2)
    this._listenKeyboard(this.$.kb3)
    this._listenPCKeyboard([81,50,87,51,69,82,53,84,54,89,55,85,73,57,79,48,80,219,187,221], 60)
    this._listenPCKeyboard([90,83,88,68,67,86,71,66,72,78,74,77,188,76,190,186,191], 60 - 12)
  },

  _listenKeyboard(keyboard) {
    keyboard.addEventListener('noteon', (e) => {
      this.$.notes.noteOn(e.detail, 127)
    })
    keyboard.addEventListener('noteoff', (e) => {
      this.$.notes.noteOff(e.detail)
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







