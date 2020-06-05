// rule = {
//     "when": "a == 1",
//     "then": "b = 'true'"
// }


// var rules = [
//     {
//         "when": "a == 1",
//         "then": "var b = 'wtf'" 
//     },
//     {
//         "when": "a == 2",
//         "then": "var b = 'wtf'" 
//     },
//     {
//         "when": "a == 3",
//         "then": "var b = 'wtf'" 
//     },
// ]

let rules = new Object();

// to be move into function, now for debug purporse
let wm = {
    'budget' : 100,
    'recommendation': []
}

function press() {
    
    for (rule of rules) {
        console.log(rule['when'],rule['is'],rule['what']);
        const condition = wm[rule['when']] + rule['is'];
        console.log(eval(condition));
        if (eval(condition)) {
            console.log(typeof wm[rule['put']]);
            if(typeof wm[rule['put']] !== 'undefined') {
                if(typeof wm[rule['put']] !== 'boolean') {
                    if(typeof wm[rule['put']] !== 'object') {
                        wm[rule['put']] = [wm[rule['put']]];
                    }
                    wm[rule['put']].push(rule['as']);
                } else {
                    wm[rule['put']] = rule['as'];
                }
            } else {
                wm[rule['put']] = rule['as'];
            }
        }
    }
    console.log(wm);
}

function loadJSON(file, callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);  
    }


function loadRules() {
    loadJSON("assets/json/rules.json",function(response) {
    // Parse JSON string into object
        rules = JSON.parse(response);
    });
}
        
function getForm() {
    var form = document.getElementById("form");
    for (i=0; i<form.elements.length; i++) {
      var field = form.elements[i];
        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
      if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;
     
      if (field.type === 'select-multiple') {
          for (var n = 0; n < field.options.length; n++) {
              if (!field.options[n].selected) continue;
              // serialized.push({
              //     name: field.name,
              //     value: field.options[n].value
              // });
              console.log(field.name, field.options[n].value)
          }
      }
      else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
          console.log(field.name, field.value)
          // serialized.push({
          //     name: field.name,
          //     value: field.value
          // });
      }
      
      // console.log(field.value);
    }
}