
Polymer({
  created() {
    this._active = { }
    this.params = { }
    this.activeNotes = { }
  },
  ready() {
  },
  noteOn(note, velocity) {
    let noteTransposed = note + this.params.transpose + this.params.octave * 12
    let gain = velocity / 127
    let freq = Math.pow(2, (noteTransposed - 69) / 12) * 440
    this._queueFor(note).push(this.synthesizer.note({ freq, vel: gain }))
    this._update()
  },
  noteOff(note, velocity) {
    this._queueFor(note).shift().release()
    this._update()
  },
  _queueFor(note) {
    return this._active[note] || (this._active[note] = [])
  },
  _update() {
    let active = { }
    for (let k in this._active) {
      if (this._active[k] && this._active[k].length) active[k] = true
    }
    this.activeNotes = active
  },
})

