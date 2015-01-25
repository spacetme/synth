
Polymer({
  created() {
    this.presets = []
  },
  save(name, voice) {
    this.presets = this.presets.concat([
      { name: name, voice: voice, createdAt: new Date().getTime() }
    ])
  },
})
