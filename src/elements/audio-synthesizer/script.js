
var AudioContext = window.AudioContext || window.webkitAudioContext

// Unit :: (params, parentUnit) -> Synthesizer
// Synthesizer :: (note) -> voice
let ctx = new AudioContext()
let log = debug('audio-synthesizer')

function UnitFactory(name, callback) {
  return function Unit(params, parent) {
    return function Voice(note) {
      log('Creating %s', name)
      let prev = parent(note)
      let connections = []
      let modules = []
      let context = {
        module(m) {
          modules.push(m)
        },
        connect(a, b, ...args) {
          log('Connecting %s -> %s', a, b)
          a.connect(b, ...args)
          connections.push(a)
        }
      }
      let node = callback.call(context, params, note, prev.node)
      return {
        node,
        release() {
          log('Releasing %s', name)
          return Promise.all([
            context.onRelease ? context.onRelease() : Promise.resolve(),
            prev.release(),
            Promise.all(modules.map(m => m.release())),
          ]).then(() => this.kill())
        },
        kill() {
          log('Killing %s', name)
          for (let connection of connections) {
            connection.disconnect()
          }
          for (let module of modules) {
            module.kill()
          }
        }
      }
    }
  }
}

function ADSR(options, param) {
  let min = options.min || 0
  let max = options.max || 1
  let a = options.a || 0
  let d = options.d || 0
  let s = options.s || 1
  let r = options.r || 0
  let sustain = min + (max - min) * s
  param.value = min
  param.cancelScheduledValues(0)
  param.setValueAtTime(min, ctx.currentTime)
  param.linearRampToValueAtTime(max, ctx.currentTime + a)
  param.linearRampToValueAtTime(sustain, ctx.currentTime + a + d)
  return {
    release() {
      let value = param.value
      param.cancelScheduledValues(0)
      param.value = value
      param.setValueAtTime(value, ctx.currentTime)
      param.linearRampToValueAtTime(min, ctx.currentTime + r)
      return new Promise(resolve => setTimeout(resolve, r * 1000 + 100))
    },
    kill() {
      param.cancelScheduledValues(0)
    }
  }
}

function LFO(options, param) {
  let osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = options.freq
  osc.start(0)
  let gain = ctx.createGain()
  gain.gain.value = options.amount
  osc.connect(gain)
  gain.connect(param)
  return {
    release() {
    },
    kill() {
      osc.disconnect()
      gain.disconnect()
    }
  }
}

let UNITS = {
  Initial() {
    return function() {
      let node = ctx.createGain()
      log('Initial Node created!')
      return {
        node,
        release() {
          return Promise.resolve()
        },
        kill() {
        }
      }
    }
  },
  Oscillator: UnitFactory('Oscillator', function(params, note, prev) {
    let node = ctx.createOscillator()
    node.type = params.type
    node.frequency.value = note.freq
    node.detune.value = params.freq.detune
    node.start(0)
    let gain = ctx.createGain()
    let adsrParams = Object.assign({ max: note.vel }, params.gain.adsr)
    this.connect(node, gain)
    this.module(ADSR(adsrParams, gain.gain))
    if (params.freq.lfo.active) {
      this.module(LFO(params.freq.lfo, node.detune))
    }
    if (params.mode === 'mix') {
      let mixer = ctx.createGain()
      this.connect(prev, mixer)
      this.connect(gain, mixer)
      return mixer
    } else if (params.mode === 'fm') {
      let fm = ctx.createGain()
      fm.gain.value = params.fm.amount
      this.connect(prev, fm)
      this.connect(fm, node.frequency)
      return gain
    } else {
      throw new Error('Invalid mode', params.mode)
    }
  }),
  Output: UnitFactory('Output', function(params, note, prev) {
    this.connect(prev, params.destination)
    return params.destination
  })
}

function compile(synth) {
  let unit = UNITS.Initial()
  for (let item of synth.voice) {
    unit = UNITS[item.type](item.params, unit)
  }
  unit = UNITS.Output({ destination: ctx.destination }, unit)
  return function(note) {
    return unit(note)
  }
}

Polymer({
  created() {
    this.model = {
      voice: [ ]
    }
  },
  ready() {
    this.compile()
  },
  modelChanged() {
    this.compile()
  },
  note(data) {
    return this.synth(data)
  },
  compile() {
    this.synth = compile(this.model)
  },
})







