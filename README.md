# Mass Shooting Fatalities
A data-driven audio + animation experiment representing the loss of life due to mass shootings in the United States since 1997. The data in `input/` comes from Mother Jones' [mass shootings investigation](http://www.motherjones.com/politics/2012/12/mass-shootings-mother-jones-full-data).

This project is based on two previous projects: [midi-shootings](https://github.com/julia67/midi-shootings) and [animated-data-sonification](https://github.com/julia67/animated-data-sonification).

**Demo:** [The last 20 years of mass shooting fatalities](http://julia-smith.com/shooting-fatalities)

## Quickstart
	python -m SimpleHTTPServer

## Basic process
- Running `$ python fatalities.py` will take the CSV in the `input` directory and produce a MIDI file (`fatalities.mid`), as well as some associated JSON (`data/fatalities.js`).
- Once the MIDI file is created, open it in GarageBand and export it as an MP3 (`media/fatalities.mp3`).
- `index.html` and `main.js` use the data from `fatalities.js` to synchronize the animations with the MP3 file.