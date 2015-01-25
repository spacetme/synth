
Polymer({
  eventDelegates: {
    presetselect: '_selected'
  },
  ready() {
    if (this.storage) this.saved = this.storage.all()
  },
  storageChanged() {
    this.saved = this.storage.all()
  },
  created() {
  },
  show() {
    this.$.overlay.opened = true
  },
  _selected() {
    this.$.overlay.opened = false
  },
})
