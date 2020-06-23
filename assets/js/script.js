// Animation
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var current_fs_index = 1;

// Inference Engine
let rules = new Object(); // to store rules list
let items = new Object(); // to store items list
let wm = {}; // W
let firedRules = [];

// // Explanation Module
// let label = []; // for tag labelling

// Disable all images to be draggable
$("img").attr("draggable",false);

// Load header and footer
$(function(){
    $("header").load("assets/html/header.html"); 
    $("footer").load("assets/html/footer.html"); 
});

// Load rules list
$.getJSON("assets/json/rules.json", function(data) {
    rules = data;
});

// Load items list
$.getJSON("assets/json/items.json", function(data) {
    items = data;
});

// Adjust footer position dynamically
$(window).resize(function() {
    $(".form-container").height($('#msform > fieldset').eq(current_fs_index-1).height());
  });

// Disable carousel auto-scroll
$('.carousel').carousel({
    interval: false,
  });

// Prevent negative value
$("input[type=number]").keydown(function (e) {
    if(!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58) 
      || e.keyCode == 8)) {
        return false;
    }
    $(this).parents("fieldset").children(".next").prop("disabled", false);
})

$("#age").on('input',function () {
    var max = parseInt($(this).attr('max'));
    var min = parseInt($(this).attr('min'));
    if ($(this).val() > max)
    {
        $(this).val(max);
    }
    else if (($(this).val() < min) || $(this).val() == "")
    {
        $(this).val(min);
    }
});

// Validate input to enable next button
$("fieldset :input").change(function () {
    $(this).parents("fieldset").children(".next").prop("disabled", false);
})

// Make checkbox as radio button
// $("#occ :input").change(function () {
//     $(this).parents('fieldset').find('label').removeClass("active");
//     $(this).addClass("active");
//     alert("run");
//     $.fn.getForm("#msform");
//     console.log(wm)
// });

$(".occ-button").click(function () {
    $(this).parents('fieldset').find('label').removeClass("active");
    $(this).addClass("active");
})


// $("#occassion label").on("click", function () {
//     console.log("run");
//     $(this).parents('fieldset').find('label').removeClass("active");
//     $(this).addClass("active");

//     $.fn.getForm("#msform");
//     console.log(wm)
// });



// Next & submit animation
$(".next").click(function(){
    // animation
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
    current_fs_index = $(this).index();
    
	//activate next step on progressbar using the index of next_fs
	// $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	
	//show the next fieldset
	next_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
    });
    // /.amimation

    // $("input:radio").change(function () {$("#postGender").prop("disabled", false);})

    // Footer re-position
    $(".form-container").height(next_fs.height());

    // If the next button is submit button
    if ($(this).hasClass("submit")) {
        $.fn.forwardChaining("#msform");
        if (wm.hasOwnProperty("recommendation")) {
            var matched = []
            for(recommendation of wm["recommendation"]) {
                var test = items.filter(function (category) {
                    var x = category.filter(function (item) {
                        return item.id == recommendation
                    })
                    if ((x.length != 0) && (typeof x !== "undefined")) {
                        matched.push(...x)
                    }
                })
            }
            $("#recommendation").children(".carousel-inner").displayItem(matched);

            if (matched.length <= 3) {
                $(".recommendation-arrow").css("display","none");
            }
        } else {
            $("#recommendation").css("display","none");
            $("#ohno").css("display","block");
        }
    }
});

// Pop up modal window for each item detail
$("#recommendation .carousel-inner").on("click",".carousel-item .item-container", function () {
    var id = $(this).attr("for");
    var matched = null;
    var test = items.filter(function (category) {
        var x = category.filter(function (item) {
            return item.id == id
        })
        if ((x.length != 0) && (typeof x !== "undefined")) {
            matched = x[0];
        }
    })
    $(".popup-overlay, .popup-content, .buy-button, .item-img, .item-name, .item-price").addClass("active");
    $(".popup-content").children(".item-img").attr("src","assets/"+matched.img);
    $(".popup-content").children(".item-name").html(matched.name);
    $(".popup-content").children(".item-price").html(matched.price);
    $(".popup-content").children(".buy-button").attr("onclick",'location.href=\"'+matched.link+'\"');
});

// Pop up modal window for "why these items"
$("#why-button").click(function () {
    $(".popup-overlay, .popup-content, .why-title, .why-explanation").addClass("active");
})

// removes the "active" class to .popup and .popup-content when the "Close" button is clicked 
$(".close, .popup-overlay").on("click", function() {
    $(".popup-overlay, .popup-content").removeClass("active");

    $(".popup-content").find("*").each(function () {
        $(this).removeClass("active");
    })
});

// Previous button
$(".previous").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
    current_fs_index = $(this).parent().index();
    
	//de-activate current step on progressbar
	// $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
    });
    $(".form-container").height(previous_fs.height());
});


$("#magic").click(function() {
    console.log("magic");
    itemList = []
    for(categories of items) {
        for(item of categories) {
            console.log(item.id);
            if (Math.random > 0.5) {
                continue; // testing purpose, avoid too many item to be preview
            }
            
            itemList.push(item);
        }
    }

    $('#items').children('.carousel-inner').displayItem(itemList);
});


// Pop up modal window for each item detail
$("#items .carousel-inner").on("click",".carousel-item .item-container", function () {
    var id = $(this).attr("for");
    console.log(id);
    var matched = null;
    var test = items.filter(function (category) {
        var x = category.filter(function (item) {
            return item.id == id
        })
        if ((x.length != 0) && (typeof x !== "undefined")) {
            matched = x[0];
        }
    })


    $(".popup-overlay, .why-title, .popup-content, .buy-button, .item-img, .item-name, .item-price").addClass("active");    
    $(".item-img").attr("src","assets/"+matched.img);
    $(".item-name").html(matched.name);
    $(".item-price").html(matched.price);
    $(".buy-button").attr("onclick",'location.href=\"'+matched.link+'\"');

    $.fn.backwardChaining(id);
    
    $("#for-explanation").explaination(wm,"facts");

});


// let wm = {};
// let firedRules = [];

// Define jQuery Function
$(document).ready(function(){
    $.fn.getForm = function(form){ 
        var data = $(form).serializeArray();
        console.log(data);
        $.each(data, function(index, value) {
            $.fn.addToWM(value.name,value.value);
        })
    }


    $.fn.addToWM = function(name,value) {
        if(!isNaN(value) && typeof value !== 'boolean') {
            value = parseInt(value);
        }
        console.log("wm[name] ",wm[name]);
        if(typeof wm[name] !== 'undefined') {
            if(typeof wm[name] !== 'boolean') {
                if(typeof wm[name] !== 'object') {
                    wm[name] = [wm[name]];
                }
                if (typeof value == "object") {
                    for (i = 0; i<value.length;i++) {
                        if(!wm[name].includes(value[i])){
                            wm[name].push(value[i]);
                        }
                    }
                } else {
                    if(!wm[name].includes(value)){
                        wm[name].push(value);
                    }
                }
            } else {
                wm[name] = value;
            }
        } else {
            wm[name] = value;
        }
    }

    $.fn.forwardChaining = function(form) {
        $.fn.getForm(form);
        let currentRule = Object.assign([], rules);
        for (i=0; i<currentRule.length;i++) {
            var condition = "";
            console.log(currentRule);
            console.log(typeof currentRule[i].when);

            if (typeof currentRule[i].when == 'object') {
                console.log("not single rule");
                for (j=0;j<currentRule[i].when.length;j++) {
                    console.log(typeof currentRule[i].when[j]);
                    if (typeof currentRule[i].when[j] == 'object') { // AND
                        var andPass;
                        for(p = 0 ; p < currentRule[i].when[j].length ; p++) {
                            if ((wm.hasOwnProperty(currentRule[i].when[j][p])) && (typeof wm[currentRule[i].when[j][p]] == "object")) {
                                console.log(`${currentRule[i].when[j][p]} in WM is object`);

                                var arr = "";

                                for (q = 0; q <  wm[currentRule[i].when[j][p]].length ; q++) {
                                    arr += `"${wm[currentRule[i].when[j][p]][q]}"`;
                                    
                                    if(q != wm[currentRule[i].when[j][p]].length - 1) {
                                        arr += ",";
                                    }
                                }

                                condition += `( [${arr}].includes("${currentRule[i].what[j][p]}") )`;
                            } else if (typeof currentRule[i].what[j][p] == "string") {
                                condition += `( "${wm[currentRule[i].when[j][p]]}"  ${currentRule[i].is[j][p]}  "${currentRule[i].what[j][p]}" )`;

                            } else {
                                condition += `( ${wm[currentRule[i].when[j][p]]}  ${currentRule[i].is[j][p]}  ${currentRule[i].what[j][p]} )`;
                            }
                            if(p != currentRule[i].when[j].length - 1) {
                                condition += "&&";
                            }
                        }

                    } else { // OR
                        console.log(`[OR RULE] ${currentRule[i].when[j]}`);
                        if (typeof currentRule[i].what[j] == "string") {
                            condition += `( "${wm[currentRule[i].when[j]]}"  ${currentRule[i].is[j]}  "${currentRule[i].what[j]}" )`;

                        } else {
                            condition += `( ${wm[currentRule[i].when[j]]}  ${currentRule[i].is[j]}  ${currentRule[i].what[j]} )`;
                        }
                        if(j != currentRule[i].when.length - 1) {
                            condition += "||";
                        }   
                    }
                }
            } else { // SINGLE RULE
                if (typeof currentRule[i].what == "string") {
                    condition += `( "${wm[currentRule[i].when]}"  ${currentRule[i].is}  "${currentRule[i].what}" )`;

                } else {
                    condition += `( ${wm[currentRule[i].when]}  ${currentRule[i].is}  ${currentRule[i].what} )`;
                }
            }

            console.log(`[${i}] ${condition}`);
            console.log(eval(condition));

            if (eval(condition)) {
                console.log("condition is true");
                console.log(wm);
                $.fn.addToWM(currentRule[i].put,currentRule[i].as);
                console.log(wm);
                var removed = currentRule.splice(i,1);
                console.log(`removed ${removed}`);
                firedRules.push(...removed);
                i = -1;
            }
        }
        console.log(wm);
        $(".why-explanation").explaination(firedRules,"rules");
    }

    $.fn.backwardChaining = function(id) {
        wm = {}; // clear wm
        let currentRule = Object.assign([], rules);
        $.fn.addToWM("recommendation",id);
        console.log(id);
        for (i=0; i<currentRule.length;i++) {
            var condition = "";
            if (typeof currentRule[i].put == 'object') {
                for (j=0;j<currentRule[i].put.length;j++) {
                    if (typeof wm[currentRule[i].put[j]] == "object") {
                        var arr = ""
                        for (p = 0 ; p < wm[currentRule[i].put[j]].length; p++) {
                            if (typeof wm[currentRule[i].put[j]][p] == "string") {
                                arr += `"${wm[currentRule[i].put[j]][p]}"`;
                            } else {
                                arr += `${wm[currentRule[i].put[j]][p]}`;
                            }

                            if(p != wm[currentRule[i].put[j]].length -1){
                                arr += ","
                            }
                        }
                        if (typeof currentRule[i].as == "string ") {
                            condition += `([${arr}].includes("${currentRule[i].as}"))`;
                        } else {
                            condition += `([${arr}].includes(${currentRule[i].as}))`;
                        }
                    } else {
                        if (typeof currentRule[i].as[j] == "string") {
                            condition += `( "${wm[currentRule[i].put[j]]}"  ==  "${currentRule[i].as[j]}" )`;

                        } else {
                            condition += `( ${wm[currentRule[i].when[j]]}  ==  ${currentRule[i].what[j]} )`;
                        }      
                    }  
                    if(j != currentRule[i].when.length - 1) {
                        condition += "||";
                    } 
                    
                }
            } else {
                if (typeof currentRule[i].as == "object") {
                    var arr = ""
                    for (p = 0 ; p < currentRule[i].as.length; p++) {
                        if (typeof currentRule[i].as[p] == "string") {
                            arr += `"${currentRule[i].as[p]}"`;
                        } else {
                            arr += `${currentRule[i].as[p]}`;
                        }

                        if(p != currentRule[i].as.length -1){
                            arr += ","
                        }
                    }
                    if (typeof wm[currentRule[i].put] == "string") {
                        condition += `([${arr}].includes("${wm[currentRule[i].put]}"))`;
                    } else {
                        condition += `([${arr}].includes(${wm[currentRule[i].put]}))`;
                    }
                } else if((typeof wm[currentRule[i].put] == "object")) {
                    
                    var arrWM = "";

                    for (n = 0 ; n < wm[currentRule[i].put].length; n++) {
                        if (typeof wm[currentRule[i].put][n] == "string") {
                            arrWM += `"${wm[currentRule[i].put][n]}"`;
                        } else {
                            arrWM += `${wm[currentRule[i].put][n]}`;
                        }

                        if(n != wm[currentRule[i].put].length - 1){
                            arrWM += ","
                        }
                    }

                    if (typeof currentRule[i].as == "object") {
                        var arrRule = "";
                        for (m = 0 ; m < currentRule[i].as.length; m++) {
                            if (typeof currentRule[i].as[m] == "string") {
                                arrRule += `"${currentRule[i].as[m]}"`;
                            } else {
                                arrRule += `${currentRule[i].as[m]}`;
                            }

                            if(m != currentRule[i].as.length - 1){
                                arrRule += ","
                            }
                        }
                        condition += `([${arrWM}].includes("${arrRule}"))`;
                    } else if (typeof currentRule[i].as == "string") {
                        condition += `([${arrWM}].includes("${currentRule[i].as}"))`;
                    } else {
                        condition += `([${arrWM}].includes(${currentRule[i].as}))`;
                    }

                    
                    
                } else {
                    if (typeof currentRule[i].as == "string") {
                        condition += `( "${wm[currentRule[i].put]}"  ==  "${currentRule[i].as}" )`;
                    } else {
                        condition += `( ${wm[currentRule[i].put]}  ==  ${currentRule[i].as} )`;
                    }      
                }  
            }

            console.log(`[${i}] ${condition}`);
            console.log(eval(condition));

            if (eval(condition)) {
                console.log("condition is true");
                console.log(wm);
                if (typeof currentRule[i].when == "object") {
                    for(k=0;k<currentRule[i].when.length;k++) {
                        if (typeof currentRule[i].when[k] == "object") {
                            for(m=0;m<currentRule[i].when[k].length ; m++) {
                                $.fn.addToWM(currentRule[i].when[k][m],currentRule[i].what[k][m])
                            }
                        } else {
                            $.fn.addToWM(currentRule[i].when[k],currentRule[i].what[k])
                        }
                    }
                } else {
                    $.fn.addToWM(currentRule[i].when,currentRule[i].what);
                }
                console.log(wm);
                var removed = currentRule.splice(i,1);
                console.log("removed",removed);
                firedRules.push(...removed);
                i = -1;
            }
        }
        console.log(wm);
    }


    $.fn.explaination = function(items, option) {

        // Explanation Module
        let label = []; // for tag labelling


        function getSpan(element, value=null) {
            const tagColor = [
                ["#ff634d","#ffffff"],
                ["#ffa500","#ffffff"],
                ["#f7d859","#ffffff"],
                ["##bf00ff","#ffffff"],
                ["#d3dd6c","#ffffff"],
                ["#9af94e","#ffffff"],
                ["#68df80","#ffffff"],
                ["#67ab5b","#ffffff"],
                ["#4694e9","#ffffff"],
                ["#53b7ce","#ffffff"]
            ]
        
            let colorCode = null;
            if (label.includes(element)) {
                colorCode = label.indexOf(element);
            } else {
                label.push(element);
                colorCode = label.indexOf(element);
            }
            
            if(value == null) value = element;

            spanCode = `<span id=\"tag\" style=\"background-color:${tagColor[colorCode][0]}\">${value}</span>`
            return spanCode
        }

        


        var why = "";

        switch(option) {
            case "rules":
                // for(item of items) {
                //     if (item.when != "recommendation_cat") {
                //         why += "<p>";
    
                //         if (typeof item.when == "object") {
                //             for(i = 0; i<item.when.length;i++) {
                //                 why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when[i]) +"\">" + item.when[i] + "</span>";
                //                 why += " is "
                //                 why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when[i]) +"\">" + wm[item.when[i]]+ "</span>";;
    
                //                 if (i != item.when.length-1) {
                //                     why += " and "
                //                 }
                //             }
                //         } else {
                //             why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when) +"\">" + item.when + "</span>";
                //             why += " is ";
                //             why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when) +"\">" + wm[item.when] + "</span>";
                //         }
                //         why += ", so ";
                //         if (item.when == "budget") {
                //             why += `the gift will be in ${getSpan(item.put)} range`;
                //         } else {
                //             why += `${getSpan(item.put)} is ${getSpan(item.put,item.as)}`;
                //         }
                //         why += "</p>";
                //     }
                // } 
                break;
            case "facts":
                for(attr in items) {
                    if (items.hasOwnProperty(attr)) { 
                        switch(attr) {
                            case "occasion":
                                why += `<p>You can give this gift during ${getSpan(attr)} like ${getSpan(attr,items[attr])}</p>`;
                                break;
                            case "interest":
                                why += `<p>This gift is suitable for someone who have ${getSpan(attr)} with ${getSpan(attr,items[attr])}</p>`;
                                break;
                            case "age":
                                var age_group = "";
                                if (items.hasOwnProperty("age group")) {
                                    if (typeof items["age group"] == "object") {
                                        let nAgeGroup = items["age group"].length
                                        for (k=0; k<nAgeGroup ; k++) {
                                            age_group += getSpan("age group", items["age group"][k]);
                                            if ((nAgeGroup == 2) && (k != nAgeGroup - 1)) {
                                                age_group += "or";
                                            } else if (k != nAgeGroup - 1){
                                                age_group += ", "
                                            }
                                        }
                                    } else {
                                        age_group += items["age group"];
                                    }
                                } else {
                                    age_group += "person";
                                }


                                if (typeof items[attr] == "object"){
                                    why += `<p>For a ${getSpan("age group",items["age group"])} who ${getSpan(attr)} range from ${getSpan(attr,items[attr][0])} to ${getSpan(attr,items[attr][items[attr].length - 1])}</p>`;
                                } else {
                                    why += `<p>For a ${getSpan("age group",items["age group"])} who ${getSpan(attr)} at around ${getSpan(attr,items[attr])}</p>`;
                                }
                                break;
                            case "gender":
                                why += `<p>The gift is for a ${getSpan(attr,items[attr])} receipient</p>`;
                                break;
                            case "budget":
                                why += `<p>If your ${getSpan(attr)} is around ${getSpan(attr,`RM ${items[attr][0]}`)}</p>`;
                                break;
                        }
                    }
                }
                break;
            default:
                why = "Unknown error occured";
                break;
        }
        $(this).html(why);
    }

    $.fn.displayItem = function(items, overwrite=true) {
        var itemList = "";
        for(i = 0; i<items.length;i++) {
            item = items[i];
            if((i+1)%3 == 1) {
                if ((i == 0) && overwrite) {
                    itemList += '<div class="carousel-item active"><div class="row btn-group btn-group-toggle" data-toggle="buttons"><div class="empty"></div>';

                } else {
                    itemList += '<div class="carousel-item"><div class="row btn-group btn-group-toggle" data-toggle="buttons"><div class="empty"></div>';
                }
            }            

            itemList += '<div class=\"item-container\" for=\"'+item.id+'\">'+
            '<img for=\"'+item.id+'\" class="carousel-item-img" src=\"assets/'+item.img+'\"/>'+
            '<p class="carousel-item-title">'+item.name+'</p>'+
            ' </div>';

            if(((i+1)%3 == 0) || (i == items.length)) {
                itemList += '<div class="empty"></div></div></div>'
            }
        }

        $(this).html(itemList);
    }
    
});










// DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV 



// $.getJSON("assets/json/rules_test.json", function(data) {
//     rules = data;
// });


// wm = {
//     "budget": 200,
//     "occassion": "anniversary",
//     "interest": "flowers"
// }



/* 
rule = {
    "when" : [[[["x","y"],"AND"],"z"],"OR"]
    "is": [[[["==","=="],"AND"],"=="],"OR"]
    "what": [[[[1,2],"AND"],3],"OR"]
    "put": "something"
    "as": "nothing"
}


cond = {
    "when" : [[[["x","y"],"AND"],"z"],"OR"]
    "is": [[[["==","=="],"AND"],"=="],"OR"]
    "what": [[[[1,2],"AND"],3],"OR"]
}

*/




// let test_cond = {
//     "when" : [[[["x","y"],"OR"],"z"],"AND"],
//     "is": [[[["==","=="],"OR"],"=="],"AND"],
//     "what": [[[[1,2],"OR"],3],"AND"]
// }


// let test_cond2 = {
//     "when" : [[[[[["x","y"],"OR"],"z"],"AND"],"w"],"OR"],
//     "is": [[[[[["==","=="],"OR"],"=="],"AND"],"=="],"OR"],
//     "what": [[[[[[1,2],"OR"],3],"AND"],3],"OR"]
// }



// function evaluate(cond) {
//     console.log(cond);
//     wm = {
//         "x": 3,
//         "y": 3,
//         "z": 3,
//         "w": 3
//     }

//     if(typeof cond.when[0][0] == "object") {
//         let sub_cond = {
//             "when": cond.when[0][0],
//             "is" :cond.is[0][0],
//             "what": cond.what[0][0]
//         }
//         sub_cond_result = evaluate(sub_cond);
//         outer_cond = ""
//         switch(cond.when[1]) {
//             case "OR":
//                 logic_symbol = "||";
//                 outer_cond += `(${wm[cond.when[0][1]]} ${cond.is[0][1]} ${cond.what[0][1]}) ${logic_symbol} ${sub_cond_result}`;
//                 // statement += `(${wm[element[0]]} ${operator[0]} ${value[0]} ) ${logic_symbol} (${wm[element[1]]} ${operator[1]} ${value[1]} ) `;
//                 break;
//             case "AND":
//                 logic_symbol = "&&";
//                 outer_cond += `(${wm[cond.when[0][1]]} ${cond.is[0][1]} ${cond.what[0][1]}) ${logic_symbol} ${sub_cond_result}`;
//                 break;
//         }
//         // outer_cond = `(${wm[cond.when[0][1]]} ${cond.is[0][1]} ${cond.what[0][1]}) ${cond.when[1]} ${sub_cond_result}`;
//         console.log(outer_cond);
//         out_result = eval(outer_cond);
//         return out_result;
//     } else {
//         console.log("here");
//         let logic = cond.when[1];
//         let element = cond.when[0];
//         let operator = cond.is[0];
//         let value = cond.what[0];
//         let statement = "";

//         console.log(logic, element, operator, value);
//         switch(logic) {
//             case "OR":
//                 logic_symbol = "||";
//                 statement += `(${wm[element[0]]} ${operator[0]} ${value[0]} ) ${logic_symbol} (${wm[element[1]]} ${operator[1]} ${value[1]} ) `;
//                 break;
//             case "AND":
//                 logic_symbol = "&&";
//                 statement += `(${wm[element[0]]} ${operator[0]} ${value[0]} ) ${logic_symbol} (${wm[element[1]]} ${operator[1]} ${value[1]} ) `;
//                 break;
//         }
//         console.log(statement);
//         result = eval(statement);
//         console.log(result);
//         return result;
//     }
// }


$("#test_jquery").click(function(){
    console.log("run");
    
    // let wm = {
    //     "budget": 500,
    //     "gender": "male"
    // }

    let currentRule = Object.assign([], rules);
    // var condition = "";
    for (i=0; i<currentRule.length;i++) {
        var condition = "";
        console.log(currentRule[i]);
        console.log(typeof currentRule[i].when);

        // if(!wm.hasOwnProperty(currentRule[i].when)) {
        //     continue;
        // }

        if (typeof currentRule[i].when == 'object') {
            console.log("not single rule");
            for (j=0;j<currentRule[i].when.length;j++) {
                console.log(typeof currentRule[i].when[j]);
                if (typeof currentRule[i].when[j] == 'object') { // AND
                    var andPass;
                    for(p = 0 ; p < currentRule[i].when[j].length ; p++) {
                        if (typeof currentRule[i].what[j][p] == "string") {
                            condition += `( "${wm[currentRule[i].when[j][p]]}"  ${currentRule[i].is[j][p]}  "${currentRule[i].what[j][p]}" )`;

                        } else {
                            condition += `( ${wm[currentRule[i].when[j][p]]}  ${currentRule[i].is[j][p]}  ${currentRule[i].what[j][p]} )`;
                        }
                        if(p != currentRule[i].when[j].length - 1) {
                            condition += "&&";
                        }
                    }

                } else { // OR
                    console.log(`[OR RULE] ${currentRule[i].when[j]}`);
                    if (typeof currentRule[i].what[j] == "string") {
                        condition += `( "${wm[currentRule[i].when[j]]}"  ${currentRule[i].is[j]}  "${currentRule[i].what[j]}" )`;

                    } else {
                        condition += `( ${wm[currentRule[i].when[j]]}  ${currentRule[i].is[j]}  ${currentRule[i].what[j]} )`;
                    }
                    if(j != currentRule[i].when.length - 1) {
                        condition += "||";
                    }   
                }
            }
        } else { // SINGLE RULE
            if (typeof currentRule[i].what == "string") {
                condition += `( "${wm[currentRule[i].when]}"  ${currentRule[i].is}  "${currentRule[i].what}" )`;

            } else {
                condition += `( ${wm[currentRule[i].when]}  ${currentRule[i].is}  ${currentRule[i].what} )`;
            }
        }

        console.log(condition);
        console.log(eval(condition));

        if (eval(condition)) {

            $.fn.addToWM(currentRule[i].put,currentRule[i].as);
            var removed = currentRule.splice(i,1);
            firedRules.push(...removed);
            i = -1;
        }

        // if (pass) {
            //     $.fn.addToWM(currentRule[i].put,currentRule[i].as);
            //     var removed = currentRule.splice(i,1);
            //     firedRules.push(...removed);
            //     i = -1;
            // };
        // var pass = false;
        // if ((currentRule[i].when.length > 1 ) &&  typeof currentRule[i].when == 'object') {
        //     var multiPass = true;
        //     for (j = 0; j < currentRule[i].when.length; j++) {
        //         var condition = "";
        //         console.log(typeof wm[currentRule[i].when[j]]);
        //         if (typeof wm[currentRule[i].when[j]] == "string") {
        //             condition = '\"' + wm[currentRule[i].when[j]] +'\"'+ currentRule[i].is[j] + '\"'+ currentRule[i].what[j] + '\"';           
        //         } else {
        //             condition = wm[currentRule[i].when[j]] + currentRule[i].is[j] + currentRule[i].what[j];  
        //         }         
        //         console.log("[condition]",condition);
        //         console.log("[result]",eval(condition));
        //         if (!eval(condition)) {
        //             multiPass = false;
        //             break;
        //         }
        //     }
        //     console.log(multiPass);
        //     pass = multiPass;
        // }
        // else {
        //     var condition = "";
        //     console.log(currentRule[i]);
        //     console.log(typeof wm[currentRule[i].when]);
        //         if(typeof wm[currentRule[i].when] != "undefined") {
        //             if (typeof wm[currentRule[i].when] == "string") {
        //                 condition = '\"' + wm[currentRule[i].when] +'\"'+ currentRule[i].is + '\"'+ currentRule[i].what + '\"';           
        //             } else {
        //                 condition = wm[currentRule[i].when] + currentRule[i].is + currentRule[i].what;
        //             }  
        //             pass = eval(condition);
        //         }
        // }
        // if (pass) {
        //     $.fn.addToWM(currentRule[i].put,currentRule[i].as);
        //     var removed = currentRule.splice(i,1);
        //     firedRules.push(...removed);
        //     i = -1;
        // };
    }
    console.log(wm);
});




$("#bktest").click(function() {
    var id = $("#bkid").val();
    wm = {};
    let currentRule = Object.assign([], rules);

    $.fn.addToWM("recommendation",id);

    for (i=0; i<currentRule.length;i++) {
        console.log(currentRule);


        var pass = false;
        if ((currentRule[i].put.length > 1 ) &&  typeof currentRule[i].put == 'object') {
            var multiPass = true;
            for (j = 0; j < currentRule[i].put.length; j++) {
                var condition = "";
                if (typeof wm[currentRule[i].put[j]] == "string") {
                    condition = '\"' + wm[currentRule[i].put[j]] +'\"'+ "==" + '\"'+ currentRule[i].as[j] + '\"';           
                } else {
                    condition = wm[currentRule[i].put[j]] + "==" + currentRule[i].as[j];  
                }         
                console.log("[condition]",condition);
                console.log("[result]",eval(condition));
                if (!eval(condition)) {
                    multiPass = false;
                    break;
                }
            }
            pass = multiPass;
        }


        else {
            console.log(typeof currentRule[i].as);

            var condition = "";
            if(wm.hasOwnProperty(currentRule[i].put)) {
                if (typeof currentRule[i].as == "object") {
                    condition += '[';
                    for (p = 0; p < currentRule[i].as.length; p++) {
                        if (typeof currentRule[i].as[p] == "string") {
                            condition += '\"' + currentRule[i].as[p] + '\"';
                        } else {
                            condition += currentRule[i].as[p];
                        }
                        if (p != currentRule[i].as.length) {
                            condition += ",";
                        }
                    }
                    condition += ']'
                    if (typeof wm[currentRule[i].put] == "string") {
                        condition += ".includes" + '(\"'+ wm[currentRule[i].put] + '\")';    
                    } else {
                        condition += ".includes" + '('+ wm[currentRule[i].put] + ')';    
                    } 
                } else if (typeof currentRule[i].as == "boolean") {
                    console.log("boolean execute");
                    condition = 'wm.hasOwnProperty(\"' + currentRule[i].put + '\")'
                }
                else {
                    if (typeof wm[currentRule[i].put] == "string") {
                        condition = '\"' + wm[currentRule[i].put] +'\"'+ "==" + '\"'+ currentRule[i].as + '\"';           
                    } else {
                        condition = wm[currentRule[i].put] + "=="+ currentRule[i].as;
                    }  
                }
                console.log(condition);
                pass = eval(condition);
            } else if (typeof currentRule[i].as == "boolean"){
                condition = 'wm.hasOwnProperty(\"' + currentRule[i].put + '\")';
                console.log(condition);
                pass = eval(condition);
                console.log(pass);
            }
        } 
        if (pass) {
            if(typeof currentRule[i].when == "object") {
                for(q=0;q<currentRule[i].when.length;q++) {
                    $.fn.addToWM(currentRule[i].when[q],currentRule[i].what[q]);
                }
            } else {
                $.fn.addToWM(currentRule[i].when,currentRule[i].what);
            }
            var removed = currentRule.splice(i,1);
            firedRules.push(...removed);
            i = -1; //reset the loop
        };
    }
    console.log(wm);
});