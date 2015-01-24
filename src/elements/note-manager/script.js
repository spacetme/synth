
Polymer({
  created() {
    this._active = { }
  },
  ready() {
  },
  noteOn(note, velocity) {
    let gain = velocity / 127
    let freq = Math.pow(2, (note - 69) / 12) * 440
    this._queueFor(note).push(this.synthesizer.note({ freq, vel: gain }))
  },
  noteOff(note, velocity) {
    this._queueFor(note).shift().release()
  },
  _queueFor(note) {
    return this._active[note] || (this._active[note] = [])
  },
})

