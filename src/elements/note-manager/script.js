
Polymer({
  created() {
    this._active = { }
    this.params = { }
  },
  ready() {
  },
  noteOn(note, velocity) {
    let noteTransposed = note + this.params.transpose + this.params.octave * 12
    let gain = velocity / 127
    let freq = Math.pow(2, (noteTransposed - 69) / 12) * 440
    this._queueFor(note).push(this.synthesizer.note({ freq, vel: gain }))
  },
  noteOff(note, velocity) {
    this._queueFor(note).shift().release()
  },
  _queueFor(note) {
    return this._active[note] || (this._active[note] = [])
  },
})

