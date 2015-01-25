
void (function() {

  let log = debug('synth-binding')

  let Op = {
    add(n) {
      return {
        forward: x => x + n,
        reverse: x => x - n,
      }
    },
    times(n) {
      return {
        forward: x => x * n,
        reverse: x => x / n,
      }
    },
    pow(n) {
      return {
        forward: x => Math.pow(x, n),
        reverse: x => Math.pow(x, 1 / n),
      }
    },
    exp(base) {
      return {
        forward: x => Math.pow(base, x),
        reverse: x => Math.log(x) / Math.log(base),
      }
    },
    sigpow(n) {
      return {
        forward: x => Math.pow(Math.abs(x), n) * Math.sign(x),
        reverse: x => Math.pow(Math.abs(x), 1 / n) * Math.sign(x),
      }
    },
    round() {
      return {
        forward: x => Math.round(x),
        reverse: x => x,
      }
    },
  }

  let SYNTH_BINDING_TYPES = {
    percentage: {
      unit: '%',
      precision: 1,
      displayMultiplier: 100,
      pipeline: [],
    },
    gain: {
      unit: '%',
      precision: 1,
      displayMultiplier: 100,
      pipeline: [Op.add(-0.5), Op.times(2)],
    },
    fmAmount: {
      unit: '',
      precision: 1,
      pipeline: [Op.add(-0.5), Op.times(2), Op.sigpow(2), Op.times(1000)],
    },
    adsrTime: {
      unit: 's',
      precision: 3,
      pipeline: [Op.times(2), Op.pow(3)],
    },
    lcdDetune: {
      unit: '',
      precision: 0,
      pipeline: [Op.add(-0.5), Op.times(2), Op.times(2400), Op.round()],
    },
    lcdTranspose: {
      unit: '',
      precision: 0,
      pipeline: [Op.add(-0.5), Op.times(2), Op.times(12), Op.round()],
    },
    lcdOctave: {
      unit: '',
      precision: 0,
      pipeline: [Op.add(-0.5), Op.times(2), Op.times(5), Op.round()],
    },
    frequency: {
      unit: 'hz',
      precision: 2,
      pipeline: [Op.pow(2), Op.times(22100), Op.add(0)],
    },
    q: {
      unit: '',
      precision: 3,
      pipeline: [Op.add(-0.5), Op.times(2), Op.sigpow(2), Op.times(3), Op.exp(10)],
    },
    lfoFrequency: {
      unit: 'hz',
      precision: 3,
      pipeline: [Op.pow(2), Op.times(19.9), Op.add(0.1)],
    },
    lfoAmount: {
      unit: '',
      precision: 2,
      pipeline: [Op.add(-0.5), Op.times(2), Op.sigpow(2), Op.times(1200)],
    },
    lfoQAmount: {
      unit: '',
      precision: 2,
      pipeline: [Op.add(-0.5), Op.times(2), Op.sigpow(2), Op.times(2), Op.exp(10)],
    },
  }

  Polymer({
    ready() {
      this._tooltip = window.getSynthBindingTooltip()
    },
    modelChanged() {
      this.pushDataToView()
    },
    viewChanged() {
      this.pushDataToView()
      this.view.viewFn = x => this.format(x, false)
      this.view.addEventListener('tracking', (e) => {
        this._tooltip.show(this.view, this.title, this.format(e.detail))
      })
      this.view.addEventListener('trackingend', () => {
        this.pushDataToModel()
        this._tooltip.hide()
      })
    },
    format(viewValue, withUnit) {
      let value = this.viewToModel(viewValue)
      let type = this.getBindingType()
      let text = (value * (type.displayMultiplier || 1))
                    .toFixed(type.precision)
      return text + (withUnit === false ? '' : type.unit)
    },
    viewValueChanged() {
      if (!this._pushed) return
      this.pushDataToModel()
    },
    pushDataToView() {
      if (!this.view) return
      this._pushed = true
      this.view.value = this.modelToView(this.model)
      log('---> m2v', this.view, this.model, this.view.value)
    },
    pushDataToModel() {
      if (!this.view) return
      this.model = this.viewToModel(this.view.value)
      log('<--- v2m', this.view, this.model, this.view.value)
      this.fire('modelchanged')
    },
    modelToView(value) {
      let type = this.getBindingType()
      for (let i = type.pipeline.length - 1; i >= 0; i --) {
        value = type.pipeline[i].reverse(value)
      }
      return value
    },
    viewToModel(value) {
      let type = this.getBindingType()
      for (let i = 0; i < type.pipeline.length; i ++) {
        value = type.pipeline[i].forward(value)
      }
      return value
    },
    getBindingType() {
      return SYNTH_BINDING_TYPES[this.type]
    },
  })
}())
