
Polymer({
  eventDelegates: {
    presetselect: '_selected'
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
