module.exports =  [
    {
      "name": "Upper Case",
      "insert": false,
      "description": "Makes the text all Upper Cased.",
      "script": "SP.text = SP.text.toUpperCase()",
      "system": true
    },
    {
      "name": "Lower Case",
      "insert": false,
      "description": "Makes the text all lower cased.",
      "script": "SP.text = SP.text.toLowerCase()",
      "system": true
    },
    {
        "name": "Title Case",
        "insert": false,
        "description": "Makes the text Title cased.",
        "script": "function TitleCase(t){var a=t.split(' ');var e=['to','an','and','at','as','but','by','for','if','in','on','or','is','with','a','the','of','vs','vs.','via','via','en','I','II','III','IV','V','VI','VII','VIII','IX','X','HTML','CSS','AT&T','PHP','Python','JavaScript','IBM'];for(var r=0;r<a.length;r++){var o=a[r];var s=false;for(var I=0;I<e.length;I++){if(o.toLowerCase()===e[I].toLowerCase()){o=e[I];s=true}}if(!s){o=o.charAt(0).toUpperCase()+o.substr(1).toLowerCase()}a[r]=o}a[0]=a[0].charAt(0).toUpperCase()+a[0].substr(1).toLowerCase();return a.join(' ')}SP.text=TitleCase(SP.text);",
        "system": true
    },
    {
        "name": "Snake Case",
        "insert": false,
        "description": "Makes the text Snake cased, or underlines instead of spaces.",
        "script": "function SnakeCase(e){if(e.indexOf(' ')!==-1)return e.split(' ').join('_');else return e.split('_').join(' ')}SP.text=SnakeCase(SP.text);",
        "system": true
    },
    {
        "name": "Lower Camel Case",
        "insert": false,
        "description": "Makes all the words together with the first word all lower cased and each other word capitalized.",
        "script": "function LowerCamelCase(e){var a=e.split(' ');for(var r=0;r<a.length;r++){var t=a[r];if(r!==0){t=t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()}else{t=t.toLowerCase()}a[r]=t}return a.join('')}SP.text=LowerCamelCase(SP.text);",
        "system": true
    },
    {
        "name": "Upper Camel Case",
        "insert": false,
        "description": "Makes all the words capitalized and without spaces.",
        "script": "function UpperCamelCase(e){var a=e.split(' ');for(var r=0;r<a.length;r++){var t=a[r];t=t.charAt(0).toUpperCase()+t.substr(1).toLowerCase();a[r]=t}return a.join('')}; SP.text=UpperCamelCase(SP.text);",
        "system": true
    },
    {
        "name": "Hyphen Case",
        "insert": false,
        "description": "Makes all the spaces into hyphens. Running it again changes all the hyphens to spaces.",
        "script": "function HyphenCase(e){if(e.indexOf(' ')!==-1)return e.split(' ').join('-');else return e.split('-').join(' ')}SP.text=HyphenCase(SP.text);",
        "system": true
    },
    {
        "name": "URI Encode",
        "insert": false,
        "description": "Encodes the text for a URI.",
        "script": "SP.text = encodeURIComponent( SP.text )",
        "system": true
    },
    {
        "name": "URI Decode",
        "insert": false,
        "description": "Decodes URI encoded text.",
        "script": "SP.text = decodeURIComponent( SP.text )",
        "system": true
    },
    {
        "name": "HTML Escape",
        "insert": false,
        "description": "Escapes special characters using HTML escaping.",
        "script": "var e = document.createElement( 'DIV' ); var t = document.createTextNode( SP.text );e.appendChild( t );SP.text = e.innerHTML;",
        "system": true
    },
    {
        "name": "Undo HTML Escaping",
        "insert": false,
        "description": "Undoes HTML escaping.",
        "script": "var e = document.createElement( 'DIV' );e.innerHTML = SP.text; SP.text = e.childNodes.length === 0 ? ' : e.childNodes[ 0 ].nodeValue;",
        "system": true
    },
    {
        "name": "Surround with ()",
        "insert": false,
        "description": "Surrounds the text in ().",
        "script": "SP.text = '(' + SP.text + ')'",
        "system": true
    },
    {
        "name": "Surround with []",
        "insert": false,
        "description": "Surrounds the text in [].",
        "script": "SP.text = '[' + SP.text + ']'",
        "system": true
    },
    {
        "name": "Surround with {}",
        "insert": false,
        "description": "Surrounds the text in {}.",
        "script": "SP.text = '{' + SP.text + '}'",
        "system": true
    },
    {
        "name": "Surround with **",
        "insert": false,
        "description": "Surrounds the text in '**'.",
        "script": "SP.text = '**' + SP.text + '**'",
        "system": true
    },
    {
        "name": "Bullet Lines with *",
        "insert": false,
        "description": "Puts a '* ' at the front of each line of text.",
        "script": "function BulletItems(t){var l=t.match(/^.*((\\r\\n|\\n|\\r)|$)/gm);for(var n=0;n<l.length;n++){l[n]='* '+l[n]}return l.join('')}SP.text=BulletItems(SP.text);",
        "system": true
    },
    {
        "name": "Bullet Lines with Numbers",
        "insert": false,
        "description": "Puts a number, period, and a space in the front of each line of text. The numbers are sequential from 1.",
        "script": "function NumberItems(t){var r=t.match(/^.*((\\r\\n|\\n|\\r)|$)/gm);var n=1;for(var e=0;e<r.length;e++){r[e]=n.toString()+'. '+r[e];n++}return r.join('')}SP.text=NumberItems(SP.text);",
        "system": true
    },
    {
        "name": "Undo Line Numbering",
        "insert": false,
        "description": "Removes the line numbering from the beginning of each line.",
        "script": "for(var lines=SP.text.split('\\n'),i=0;i<lines.length;i++){var match=lines[i].match(/^\\d+\\.\\ (.*)$/);null!=match&&(lines[i]=match[1])}SP.text=lines.join('\\n');",
        "system": true
    },
    {
        "name": "Insert Date & Time",
        "insert": true,
        "description": "Inserts the current date and time at the cursor point.",
        "script": "SP.text = SP.moment().format('MMMM DD, YYYY, h:mm:ss a');",
        "system": true
    },
    {
        "name": "Insert Date",
        "insert": true,
        "description": "Inserts the current date at the cursor point.",
        "script": "SP.text = SP.moment().format('MMMM DD, YYYY');",
        "system": true
    },
    {
        "name": "Insert Time",
        "insert": true,
        "description": "Inserts the current time at the cursor point.",
        "script": "SP.text = SP.moment().format('h:mm:ss a');",
        "system": true
    },
    {
        "name": "Insert Day of Week",
        "insert": true,
        "description": "Inserts the current name of the day of the week at the cursor point.",
        "script": "SP.text = SP.moment().format('dddd');",
        "system": true
    },
    {
        "name": "Insert Date/Time by Format",
        "insert": false,
        "description": "Takes the selected text as formatting for the date/time function.",
        "script": "SP.text = SP.moment().format(SP.text);",
        "system": true
    },
    {
        "name": "Number of Days from Now",
        "insert": false,
        "description": "Takes the selected number and gives the date that many days in the future.",
        "script": "SP.text = SP.moment().add(SP.text,'days').format('MMMM DD, YYYY');",
        "system": true
    },
    {
        "name": "Number of Days Ago",
        "insert": false,
        "description": "Takes the selected number and gives the date that many days in the past.",
        "script": "SP.text = SP.moment().subtract(SP.text,'days').format('MMMM DD, YYYY');",
        "system": true
    },
    {
        "name": "Basic Math",
        "insert": false,
        "description": "Takes the selection and processes as math.",
        "script": "SP.text = SP.ProcessMathSelection(SP.text)",
        "system": true
    },
    {
        "name": "Evaluate Page for Math",
        "insert": false,
        "description": "Takes the entire note and processes it for math if the line starts with '>'.",
        "script": "SP.text = SP.ProcessMathNotes(SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 1 as Script",
        "insert": false,
        "description": "Takes the first note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(1), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 2 as Script",
        "insert": false,
        "description": "Takes the second note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(2), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 3 as Script",
        "insert": false,
        "description": "Takes the third note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(3), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 4 as Script",
        "insert": false,
        "description": "Takes the fourth note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(4), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 5 as Script",
        "insert": false,
        "description": "Takes the fifth note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(5), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 6 as Script",
        "insert": false,
        "description": "Takes the sixth note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(6), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 7 as Script",
        "insert": false,
        "description": "Takes the seventh note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(7), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 8 as Script",
        "insert": false,
        "description": "Takes the eighth note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(8), SP.text);",
        "system": true
    },
    {
        "name": "Evaluate Note 9 as Script",
        "insert": false,
        "description": "Takes the nineth note and runs it as the script for the text in the current note.",
        "script": "SP.text = SP.runScript(SP.returnNote(9), SP.text);",
        "system": true
    }
  ]
