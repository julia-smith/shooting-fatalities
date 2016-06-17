import datetime
import json
import csv
from miditime.MIDITime import MIDITime

# Instantiate the class with a tempo (120bpm is the default), an output file destination, number of seconds to represent a year, base octave (5 is Middle C), and octave range.
mymidi = MIDITime(120, 'fatalities.mid', 7, 2, 6) #4 was good for # of seconds for year


# Get data
f = open( 'input/motherjones-from1997.csv', 'rU' )  
reader = csv.DictReader( f, fieldnames = ( 'date','fatalities','location' )) 

my_data = []
for row in reader:
    my_data.append(row)

f.close()

#Sort by date - oldest to newest
my_data = sorted(my_data, key=lambda x: datetime.datetime.strptime(x['date'], '%m/%d/%Y'))

# Convert dates to "days since epoch" scale
my_data_epoched = []
for d in my_data:
    for x in xrange(0, int(d['fatalities'])):
        my_data_epoched.append({'days_since_epoch': mymidi.days_since_epoch(datetime.datetime.strptime(d['date'], '%m/%d/%Y')), 'fatalityid': float(x+1), 'total': d['fatalities'], 'location': d['location'], 'date': d['date']})

my_data_timed = [{'beat': mymidi.beat(d['days_since_epoch']), 'fatalityid': d['fatalityid'], 'total': d['total'], 'location': d['location']} for d in my_data_epoched]

start_time = my_data_timed[0]['beat']

def mag_to_pitch_tuned(fatalities):
    # Where does this data point sit in the domain of your data? (I.E. the min fatalities is 5, the max in 27). In this case the optional 'True' means the scale is reversed, so the highest value will return the lowest percentage.
    scale_pct = mymidi.linear_scale_pct(0, 49, fatalities, True)

    # Another option: Linear scale, reverse order
    # scale_pct = mymidi.linear_scale_pct(3, 5.7, fatalities, True)

    # Another option: Logarithmic scale, reverse order
    # scale_pct = mymidi.log_scale_pct(3, 5.7, fatalities, True)

    # Pick a range of notes. This allows you to play in a key.
    c_major = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    c_minor = ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']
    chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    c_penta_major = ['C', 'D', 'E', 'G', 'A']
    c_penta_minor = ['C', 'Eb', 'F', 'G', 'Bb']

    #Find the note that matches your data point
    note = mymidi.scale_to_note(scale_pct, c_minor)

    #Translate that note to a MIDI pitch
    midi_pitch = mymidi.note_to_midi_pitch(note)

    return midi_pitch

def mag_to_duration(fatalities):
    # Where does this data point sit in the domain of your data? (I.E. the min fatalities is 5, the max in 27). In this case the optional 'True' means the scale is reversed, so the highest value will return the lowest percentage.
    scale_pct = mymidi.linear_scale_pct(0, 49, fatalities, False)

    # Another option: Linear scale, reverse order
    # scale_pct = mymidi.linear_scale_pct(3, 5.7, fatalities, True)

    # Another option: Logarithmic scale, reverse order
    # scale_pct = mymidi.log_scale_pct(3, 5.7, fatalities, True)

    #Translate that note to a MIDI duration
    midi_duration = 10 + scale_pct*20

    return midi_duration

def mag_to_attack(total):
    # Where does this data point sit in the domain of your data? (I.E. the min fatalities is 5, the max in 27). In this case the optional 'True' means the scale is reversed, so the highest value will return the lowest percentage.
    scale_pct = mymidi.linear_scale_pct(0, 49, total, False)

    #Translate that note to a MIDI duration
    midi_attack = 50 + scale_pct*70

    return midi_attack


note_list = []
json_data = []
csv_data = csv.writer(open('data/fatalities.csv', 'wb'))

#for d in my_data_timed:
for index, d in enumerate(my_data_timed):

    wDate = my_data_epoched[index]['date']
    wBeat = d['beat'] + index*.075 - start_time
    wID = d['fatalityid']
    wTotal = d['total']
    wLoc = my_data_epoched[index]['location']

    # Create a list of notes. Each note is a list: [time, pitch, attack, duration]
    note_list.append([
        wBeat, #multiply by negative 1 to reverse midi track (start at present, go to past) GO BACK IN TIME
        mag_to_pitch_tuned(float(wID)),
        mag_to_attack(float(wID)),
        mag_to_duration(float(wTotal)) # duration, in beats
    ])

    # Create csv with any data you want to use elsewhere
    csv_data.writerow([wDate, wBeat, wID, wTotal, wLoc])

    # Create json object with any data you want to use in the browser
    json_data.append({'date': wDate, 'beat': wBeat, 'fatalityid': wID, 'total': wTotal, 'location': wLoc})



with open('data/fatalities.json', 'w') as outfile:
    json.dump(json_data, outfile)

jsfile = open('data/fatalities.js', 'wb')
jsfile.write( 'var data =' + str(json_data) )
jsfile.close()


# Add a track with those notes
mymidi.add_track(note_list)

# Output the .mid file
mymidi.save_midi()