
let log = debug('keyboard-view')

Polymer({

  created() {
    this._touches = []
    this._mouse = []
    this._notes = []
  },

  updateTouches(event) {
    event.preventDefault()
    this._touches = Array.from(event.touches).map(function(touch) {
      return [touch.clientX, touch.clientY]
    })
    this._update()
  },

  mousedown(event) {
    event.preventDefault()
    let mousemove = e => {
      e.preventDefault()
      this._mouse = [[e.clientX, e.clientY]]
      this._update()
    }
    let mouseup = e => {
      e.preventDefault()
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup',   mouseup)
      this._mouse = []
      this._update()
    }
    this._mouse = [[event.clientX, event.clientY]]
    this._update()
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup',   mouseup)
  },

  ready() {

    let size = 80
    let black = 64
    let octaveSize = size * 8
    let base = -octaveSize / 2

    let keys = [ ]
    let keyMap = { }

    for (let octave = -1; octave <= 1; octave ++) {
      let n = octave * 12
      let b1 = base + octave * size * 7
      let b2 = b1 + size - black / 2

      keys.push({ width: size, type: 'white', x: b1 + 0 * size, note: n + 0 })
      keys.push({ width: size, type: 'white', x: b1 + 1 * size, note: n + 2 })
      keys.push({ width: size, type: 'white', x: b1 + 2 * size, note: n + 4 })
      keys.push({ width: size, type: 'white', x: b1 + 3 * size, note: n + 5 })
      keys.push({ width: size, type: 'white', x: b1 + 4 * size, note: n + 7 })
      keys.push({ width: size, type: 'white', x: b1 + 5 * size, note: n + 9 })
      keys.push({ width: size, type: 'white', x: b1 + 6 * size, note: n + 11 })

      keys.push({ width: black, type: 'black', x: b2 + 0 * size, note: n + 1 })
      keys.push({ width: black, type: 'black', x: b2 + 1 * size, note: n + 3 })
      keys.push({ width: black, type: 'black', x: b2 + 3 * size, note: n + 6 })
      keys.push({ width: black, type: 'black', x: b2 + 4 * size, note: n + 8 })
      keys.push({ width: black, type: 'black', x: b2 + 5 * size, note: n + 10 })
    }

    for (let key of keys) {
      keyMap[key.note] = key
    }

    this.addEventListener('noteon', (e) => {
      keyMap[e.detail].active = true
    })

    this.addEventListener('noteoff', (e) => {
      keyMap[e.detail].active = false
    })

    this.keys = keys

  },

  _update() {
    let coords = this._touches.concat(this._mouse)
    let notes = R.uniq(R.chain(([x, y]) => {
      let element = this.shadowRoot.elementFromPoint(x, y)
      if (element && typeof element.dataset.note !== 'undefined') {
        return [+element.dataset.note]
      } else {
        return []
      }
    }, coords))
    let on = R.difference(notes, this._notes)
    let off = R.difference(this._notes, notes)
    for (let note of on)  this.fire('noteon',  note)
    for (let note of off) this.fire('noteoff', note)
    this._notes = notes
  }

})







