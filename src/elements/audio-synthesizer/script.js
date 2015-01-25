
(function() {

var AudioContext = window.AudioContext || window.webkitAudioContext
var synthUnits = [ ]
var unitTemplate = { }

// Unit :: (params, parentUnit) -> Synthesizer
// Synthesizer :: (note) -> voice
let ctx = new AudioContext()
let log = debug('audio-synthesizer')

function UnitFactory(name, callback, template) {
  if (template) {
    synthUnits.push({ name })
    unitTemplate[name] = template
  }
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
            log('Disconnecting %s of %s', connection, name)
            connection.disconnect()
          }
          for (let module of modules) {
            log('Killing %s of %s', module, name)
            module.kill()
          }
        }
      }
    }
  }
}

function ADSR(options, param) {
  let min = typeof options.min !== 'undefined' ? options.min : 0
  let max = typeof options.max !== 'undefined' ? options.max : 1
  let a = options.a || 0
  let d = options.d || 0
  let s = typeof options.s !== 'undefined' ? options.s : 1
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

function Automate(options, param) {
  let { i, a, p, d, s } = options
  param.cancelScheduledValues(0)
  if (a === 0) {
    param.value = p
    param.setValueAtTime(p, ctx.currentTime)
  } else {
    param.value = i
    param.setValueAtTime(i, ctx.currentTime)
    param.linearRampToValueAtTime(p, ctx.currentTime + a)
  }
  param.setTargetAtTime(s, ctx.currentTime + a, d)
  return {
    release() {
    },
    kill() {
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
    let vel = note.vel * params.gain.volume
    let adsrParams = Object.assign({ max: vel }, params.gain.adsr)
    this.connect(node, gain)
    this.module(ADSR(adsrParams, gain.gain))
    this.module(LFO(params.freq.lfo, node.detune))
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
  }, {
    type: 'sine',
    mode: 'mix',
    freq: {
      detune: 0,
      lfo: { freq: 1, amount: 0 }
    },
    gain: {
      volume: 1,
      adsr: { a: 0, d: 0, s: 1, r: 0 }
    },
    pan: { value: 0 }
  }),
  BiquadFilter: UnitFactory('BiquadFilter', function(params, note, prev) {
    log('BiquadFilter init')
    let node = ctx.createBiquadFilter()
    node.type = params.type
    this.module(Automate(params.freq.auto, node.frequency))
    this.module(LFO(params.freq.lfo, node.detune))
    this.module(Automate(params.q.auto, node.Q))
    this.module(LFO(params.q.lfo, node.Q))
    this.connect(prev, node)
    return node
  }, {
    type: 'lowpass',
    freq: {
      lfo: { freq: 1, amount: 0 },
      auto: { i: 3000, a: 0, p: 3000, d: 0.5, s: 3000 }
    },
    q: {
      lfo: { freq: 1, amount: 0 },
      auto: { i: 1, a: 0, p: 1, d: 0.5, s: 1 }
    },
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
  get availableUnits() {
    return synthUnits
  },
  getTemplate(name) {
    return unitTemplate[name]
  },
})

})()

