# <del>synth.spacet.me</del> [ss15-spacetme.divshot.io](https://ss15-spacetme.divshot.io)

### make noise, anywhere.

[ ![Codeship Status for staticshowdown/ss15-spacetme](https://codeship.com/projects/9ffc1770-8595-0132-848e-76a8aba63565/status?branch=master)](https://codeship.com/projects/58796)

This is a web-based synthesizer. Wherever you have a web browser (Chrome or Safari), there you can play music!
The application has 2 main parts: the control panel, and the keyboards.


The Keyboard
------------

You'll see 3 rows of keyboard, which you can click to play notes.
The note will go through each unit (in the control panel) and will result in some sound.


Playing Notes
-------------

- Clicking on the on-screen keyboard.
- Touching the keys on the keyboard (e.g. when using iPad).
- Pressing the keys on your computer keyboard.
- Using Chrome Canary with Web MIDI API flag enabled (chrome://flags), playing notes on your MIDI keyboard (the synthesizer also responds to velocity in this case)



The Control Panel
-----------------

The control panel is where you can control how the synthesizer will sound like.
You also manage presets there.


### System

- __Load__: Click to load a preset.
- __Save__: Click to save the configuration as a preset. It will be local to your browser only.
- __Share__: Click to share the configuration. When clicked, the synthesizer will generate a URL that you can share with others.
- __Transpose__: Transpose all played notes (useful when you want to change keys). Drag left/right to change value.
- __Octave__: Shift all notes by amount of octaves. Drag left/right to change value.


### Adding a Unit

- Click on the "+" sign (shown when you hover the "→" between two units) and select the type of unit you want to add.


### Removing a Unit

- Click on the "▼" of the unit's title bar, and select "Remove."



### Adjusting Parameters

- Most parameters can be adjusted by dragging. While dragging, the value will be displayed.
    - Knob: drag in the direction you want the knob to point to.
    - Slider: drag up/down to change value. drag left/right for more fine-grained control.
    - Number: drag left/right to change value. drag up/down for more coarse-grained control.






