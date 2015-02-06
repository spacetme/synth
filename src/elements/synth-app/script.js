
let PRESETS = [
  {
    name: 'Simple FM',
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
  },
  {
    name: 'Square Wave',
    voice: [
      {
        type: 'Oscillator',
        params: {
          type: 'square',
          mode: 'mix',
          freq: {
            detune: 0,
            lfo: { freq: 1, amount: 0 }
          },
          gain: {
            volume: 1,
            adsr: { a: 0, d: 0.311, s: 0.35, r: 0.064 }
          },
          pan: { value: 0 }
        }
      },
    ]
  },
]

Polymer({

  created() {
    this.builtins = PRESETS
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
    unitswap: 'handleUnitSwap',
    unitduplicate: 'handleUnitDuplicate',
    unitadd: 'handleUnitAdd',
    presetsave: 'handlePresetSave',
    presetload: 'handlePresetLoad',
    presetselect: 'handlePresetSelect',
    presetshare: 'handlePresetShare',
  },

  handleModelChange() {
    this.$.synth.compile()
    this.$.stateStorage.save()
    if (this.watchVoice) {
      if (this.watchVoice !== JSON.stringify(this.model.voice)) {
        location.hash = ''
        this.watchVoice = null
      }
    }
  },

  handleUnitRemove(e, index) {
    this.model.voice.splice(index, 1)
    this.fire('modelchanged')
  },

  handleUnitSwap(e, index) {
    let [unit] = this.model.voice.splice(index - 1, 1)
    this.model.voice.splice(index, 0, unit)
    this.fire('modelchanged')
  },

  handleUnitAdd(e, { type, index }) {
    this.model.voice.splice(index, 0, {
      type: type,
      params: R.cloneDeep(this.$.synth.getTemplate(type)),
    })
    this.fire('modelchanged')
  },

  handleUnitDuplicate(e, index) {
    this.model.voice.splice(index + 1, 0, R.cloneDeep(this.model.voice[index]))
    this.fire('modelchanged')
  },

  handlePresetSave() {
    let name = prompt('Enter preset name...')
    if (!name) {
      alert('Not saved, name is empty.')
      return
    }
    this.$.storage.save(name, this.model.voice)
  },

  handlePresetShare() {
    this.$.parse.use((Parse, Preset) => {
      let name = prompt('Enter preset name...')
      if (!name) {
        alert('Not saved, name is empty.')
        return
      }
      this.saveToParse(name, this.model.voice)
    })
  },

  handlePresetLoad() {
    this.$.loader.show()
  },

  handlePresetSelect(e, details, sender) {
    this.model.voice = R.cloneDeep(details.voice)
    this.fire('modelchanged')
  },

  ready() {
    this._listenKeyboard(this.$.kb1)
    this._listenKeyboard(this.$.kb2)
    this._listenKeyboard(this.$.kb3)
    this._listenPCKeyboard([81,50,87,51,69,82,53,84,54,89,55,85,73,57,79,48,80,219,187,221], 60)
    this._listenPCKeyboard([90,83,88,68,67,86,71,66,72,78,74,77,188,76,190,186,191], 60 - 12)
    this._listenMIDIKeyboard()
    this._loadPresetFromParse()
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

  _listenMIDIKeyboard() {

    let listen = (input) => {
      console.log('listening MIDI', input.manufacturer, input.name)
      input.onmidimessage = (e) => {
        if (e.data.length !== 3) return
        let [a, b, c] = e.data
        if (a >= 0x90 && a <= 0x9F) { // note on
          if (c > 0) {
            this.$.notes.noteOn(b, c)
          } else {
            this.$.notes.noteOff(b)
          }
        } else if (a >= 0x80 && a <= 0x8F) { // note off
          this.$.notes.noteOff(b)
        }
      }
    }

    // listen to WebMidiLink messages
    listen(new WebMidiLinkListener())

    // listen to real MIDI keyboards
    if (typeof navigator.requestMIDIAccess !== 'function') return
    navigator.requestMIDIAccess().then((access) => {
      access.onconnect = (e) => {
        if (e.port.type === 'input') {
          listen(e.port)
        }
      }
      for (let input of access.inputs.values()) {
        listen(input)
      }
    })
    .then(null, (e) => {
      console.error('Cannot request MIDI keyboard', e.stack)
    })

    function WebMidiLinkListener() {
      // http://www.g200kg.com/en/docs/webmidilink/
      let input = {
        manufacturer: 'g200kg',
        name: 'WebMidiLink',
        onmidimessage: () => {}
      }
      window.addEventListener('message', e => {
        let message = e.data.split(',')
        if (message[0] !== 'midi') return
        let data = message.slice(1).map(x => parseInt(x, 16))
        input.onmidimessage({ data })
      }, false)
      return input
    }
  },

  saveToParse(name, voice) {
    this.$.parse.use((Parse, Preset) => {
      var preset = new Preset()
      preset.save({ name: name, voice: voice, public: false }).then(function(object) {
        location.hash = '#' + object.id
        prompt('Saved. Use this URL to access the saved preset.',
          location.href.replace(/#.*$|$/, '#' + object.id))
      }, function() {
        alert('Unable to share! Sorry')
      })
    })
  },

  _loadPresetFromParse() {
    let check = () => {
      let match = location.hash.match(/^#([a-zA-Z0-9_\-]+)$/)
      if (!match) return
      this.$.parse.use((Parse, Preset) => {
        let objectID = match[1]
        new Parse.Query(Preset).get(objectID).then((object) => {
          this.model.voice = R.cloneDeep(object.get('voice'))
          this.watchVoice = JSON.stringify(this.model.voice)
          this.fire('modelchanged')
        }, function() {
          alert('Unable to load! Sorry')
        })
      })
    }
    window.addEventListener('hashchange', check)
    check()
  },

})







