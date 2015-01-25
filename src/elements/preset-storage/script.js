
Polymer({
  created() {
    this._presets = []
  },
  save(name, voice) {
    this._presets = this._presets.concat([
      { name: name, voice: voice, createdAt: new Date().getTime() }
    ])
  },
  all() {
    return this._presets
  },
})
