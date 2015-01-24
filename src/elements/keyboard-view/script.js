
Polymer({

  created() {
  },

  updateTouches(event) {
    event.preventDefault()
    this.model.updateTouches(event.touches)
  },

  ready() {

    let size = 72
    let black = 56
    let octaveSize = size * 8
    let base = -octaveSize / 2

    let keys = [ ]

    for (let octave = -1; octave <= 1; octave ++) {
      let b1 = base + octave * size * 7
      let b2 = b1 + size - black / 2

      keys.push({ width: size, type: 'white', x: b1 + 0 * size, note: 0 })
      keys.push({ width: size, type: 'white', x: b1 + 1 * size, note: 2 })
      keys.push({ width: size, type: 'white', x: b1 + 2 * size, note: 4 })
      keys.push({ width: size, type: 'white', x: b1 + 3 * size, note: 5 })
      keys.push({ width: size, type: 'white', x: b1 + 4 * size, note: 7 })
      keys.push({ width: size, type: 'white', x: b1 + 5 * size, note: 9 })
      keys.push({ width: size, type: 'white', x: b1 + 6 * size, note: 11 })

      keys.push({ width: black, type: 'black', x: b2 + 0 * size, note: 1 })
      keys.push({ width: black, type: 'black', x: b2 + 1 * size, note: 3 })
      keys.push({ width: black, type: 'black', x: b2 + 3 * size, note: 6 })
      keys.push({ width: black, type: 'black', x: b2 + 4 * size, note: 8 })
      keys.push({ width: black, type: 'black', x: b2 + 5 * size, note: 10 })
    }

    this.keys = keys

  },

})

