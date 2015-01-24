
Polymer({
  created() {
  },
  ready() {
  },
  updateTouches(touches) {
    this._touches = Array.from(touches).map(function(touch) {
      return [touch.clientX, touch.clientY]
    })
  },
})

