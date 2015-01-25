
Polymer({
  eventDelegates: {
    presetselect: '_selected'
  },
  created() {
    this.fromParse = []
  },
  show() {
    this.$.overlay.opened = true
    this.parse.use((Parse, Preset) => {
      new Parse.Query(Preset).equalTo('public', true).find().then((results) => {
        this.fromParse = Array.from(results).map((result) => {
          return { name: result.get('name'),
                   voice: result.get('voice') }
        })
      })
    })
  },
  _selected() {
    this.$.overlay.opened = false
  },
})
