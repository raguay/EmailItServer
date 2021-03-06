# Dropzone Action Info
# Name: ScriptPad
# Description: This action will copy the contents of the file dropped or the text dropped and place it into the designated [ScriptPad]() note.
# Handles: Files, Text
# Creator: Richard Guay
# URL: http://customct.com
# Events: Clicked, Dragged
# KeyModifiers: Command, Option, Control, Shift
# UniqueID: 394873920485738902
# SkipConfig: No
# RunsSandboxed: Yes
# Version: 1.2
# MinDropzoneVersion: 3.6
require 'net/http'
require 'json'

def dragged
  #
  # Start the action by telling the user what your doing.
  #
  $dz.begin("Copying to ScriptPad...")
  numitems = $items.count
  scriptpadid = defined?( ENV['scriptpadid'] ) ? ENV['scriptpadid'] : "1"
  append = defined?( ENV['append'] ) ? ENV['append'] : "a"
  dragtype = defined?( ENV['dragged_type'] ) ? ENV['dragged_type'] : "text"

  #
  # Below line switches the progress display to determinate mode so we can show progress
  #
  $dz.determinate(true)
  $dz.percent(1)
  
  #
  # Index over all of the given presentations.
  #
  for index in 0 ... numitems
    #
    # Get the note text.
    #
    note = $items[index]
    if (dragtype === 'files')
      note = File.read(note)
    end

    #
    # Send it to ScriptPad.
    #
    uri = URI("http://localhost:9978/api/note/#{scriptpadid}/#{append}")
    http = Net::HTTP.new(uri.host, uri.port)
    req = Net::HTTP::Put.new(uri.path, 'Content-Type' => 'application/json')
    req.body = {note: "#{note}"}.to_json
    res = http.request(req)

    #
    # Update the percentage done.
    #
    $dz.percent((index/numitems)*100)
  end

  
  #
  # The below line tells Dropzone to end with a notification 
  # center notification with the text "Copy Complete".
  #
  $dz.finish("Copy Complete")
  
  # You should always call $dz.url or $dz.text last in your script. The below $dz.text line places text on the clipboard.
  # If you don't want to place anything on the clipboard you should still call $dz.url(false)
  $dz.url(false)
end

def clicked
  scriptpadid = defined?( ENV['scriptpadid'] ) ? ENV['scriptpadid'] : "1"
  append = defined?( ENV['append'] ) ? ENV['append'] : "a"

  #
  # Get a ScriptPad ID from the user.
  #
  config = "
    *.title = ScriptPad
    id.label = Which note to save to?
    id.type = popup
    id.option = 1
    id.option = 2
    id.option = 3
    id.option = 4
    id.option = 5
    id.option = 6
    id.option = 7
    id.option = 8
    id.option = 9
    id.default = #{scriptpadid}
    append.label = Append or Overwrite (a or w)?
    append.type = textfield
    append.default = #{append}
  "
  result = $dz.pashua(config)
  scriptpadid = result["id"].to_i
  append = result["append"]

  #
  # Set the ScriptPad ID.
  #
  $dz.save_value("scriptpadid", scriptpadid)

  #
  # Tell the user what they selected.
  #
  if (append === 'a') 
    appendtext = "and to append the text."
  else
    appendtext = "and to overwrite the text."
    append = 'w'
  end

  #
  # Set the ScriptPad ID.
  #
  $dz.save_value("append", append)

  $dz.finish("ScriptPad ID '#{scriptpadid}' #{appendtext}")
  $dz.url(false)
end
