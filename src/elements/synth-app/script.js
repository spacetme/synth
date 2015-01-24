
var AudioContext = window.AudioContext || window.webkitAudioContext

var model = {
  voice: [
    {
      type: 'Oscillator',
      params: {
        type: 'sine',
        mode: 'mix',
        freq: {
          detune: -1200,
          lfo: {
            active: false,
            freq: 4,
            amount: 100
          }
        },
        gain: {
          adsr: {
            a: 0,
            d: 0.3,
            s: 1,
            r: 1
          }
        },
        pan: {
          value: 0,
        }
      }
    },
    {
      type: 'Oscillator',
      params: {
        type: 'sine',
        mode: 'fm',
        fm: {
          amount: 500
        },
        freq: {
          detune: 0,
          lfo: {
            active: false,
            freq: 4,
            amount: 100
          }
        },
        gain: {
          adsr: {
            a: 0,
            d: 0.3,
            s: 0.6,
            r: 0.2
          }
        },
        pan: {
          value: 0,
        }
      }
    }
  ]
}

// Unit :: (params, parentUnit) -> Synthesizer
// Synthesizer :: (note) -> voice

let ctx = new AudioContext()
let log = debug('Audio')

function UnitFactory(name, callback) {
  log('UnitFactory called!')
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
    node.frequency.value = note.frequency
    node.detune.value = params.freq.detune
    node.start(0)
    let gain = ctx.createGain()
    this.connect(node, gain)
    this.module(ADSR(params.gain.adsr, gain.gain))
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

var synthesizer = compile(model)

Polymer({
  ready() {
    let voice = synthesizer({ frequnency: 440, velocity: 1 })
    setTimeout(() => voice.release(), 300)
  }
})







