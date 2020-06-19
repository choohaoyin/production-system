// MOVED TO JQUERY
// ARCHIVED FOR REFERENCE

// to be move into function, now for debug purporse
// let wm = {
// }

// function press() {
//     getForm();
//     for (rule of rules) {
//         var pass = true;
//         if ((rule['when'].length > 1 ) &&  typeof rule['when'] == 'object') {
//             for (i = 0; i < rule['when'].length; i++) {
//                 const condition = wm[rule['when'][i]] + rule['is'][i];
//                 if (!eval(condition)) pass = false;
//             }
//         }
//         else {
//             const condition = wm[rule['when']] + rule['is'];
//             if (!eval(condition)) pass = false;
//         }
//         if (pass) addToWM(rule['put'],rule['as']);
//     }
//     console.log(wm);
// }

// M0VED TO JQUERY
// function loadJSON(file, callback) {   

//     var xobj = new XMLHttpRequest();
//         xobj.overrideMimeType("application/json");
//     xobj.open('GET', file, true);
//     xobj.onreadystatechange = function () {
//         if (xobj.readyState == 4 && xobj.status == "200") {
//             // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
//             callback(xobj.responseText);
//         }
//     };
//     xobj.send(null);  
//     }


// function loadRules() {
//     loadJSON("assets/json/rules.json",function(response) {
//     // Parse JSON string into object
//         rules = JSON.parse(response);
//     });
// }


// function getForm() {
//     console.log('run');
//     wm = {}; // debugging purpose
//     var form = document.getElementById("msform");
//     for (i=0; i<form.elements.length; i++) {
//       var field = form.elements[i];
//         // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
//       if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;
     
//       if (field.type === 'select-multiple') {
//           for (var n = 0; n < field.options.length; n++) {
//               if (!field.options[n].selected) continue;
//               // serialized.push({
//               //     name: field.name,
//               //     value: field.options[n].value
//               // });
//               console.log(field.name,field.value);
//               addToWM(field.name,field.value);
//           }
//       }
//       else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
//           // serialized.push({
//           //     name: field.name,
//           //     value: field.value
//           // });
//           console.log(field.name,field.value);
//           addToWM(field.name,field.value);
//       }
//     }
// }

// function addToWM(name, value) {
//     if(!isNaN(value) && typeof value !== 'boolean') {
//         value = parseInt(value);
//     }
//     if(typeof wm[name] !== 'undefined') {
//         if(typeof wm[name] !== 'boolean') {
//             if(typeof wm[name] !== 'object') {
//                 wm[name] = [wm[name]];
//             }
//             wm[name].push(value);
//         } else {
//             wm[name] = value;
//         }
//     } else {
//         wm[name] = value;
//     }
// }

// /.MOVED TO JQUERY