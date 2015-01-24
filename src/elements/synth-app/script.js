
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
              lfo: { active: false, freq: 4, amount: 100 }
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
              lfo: { active: false, freq: 4, amount: 100 }
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
    console.log(this.$.x.model)
  },

})







