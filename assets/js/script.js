// Animation
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var current_fs_index = 1;

// Inference Engine
let rules = new Object(); // to store rules list
let items = new Object(); // to store items list

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
    console.log("rules loaded");
    rules = data;
});

// Load items list
$.getJSON("assets/json/items.json", function(data) {
    console.log("items loaded")
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
})

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

    // Footer re-position
    $(".form-container").height(next_fs.height());

    // If the next button is submit button
    if ($(this).hasClass("submit")) {
        $.fn.forwardChaining("#msform");
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
    }
});

// Pop up modal window for each item detail
$("#recommendation .carousel-inner").on("click",".carousel-item .item-container", function () {
    console.log(this)
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
            if (!["T0011","T0015","T0016","T0017","A0020","A0019"].includes(item.id)) {
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


let wm = {};
let firedRules = [];

// Define jQuery Function
$(document).ready(function(){
    $.fn.getForm = function(form){ 
        var data = $(form).serializeArray();
        $.each(data, function(index, value) {
            $.fn.addToWM(value.name,value.value);
        })
        console.log(wm)
    }


    $.fn.addToWM = function(name,value) {
        if(!isNaN(value) && typeof value !== 'boolean') {
            value = parseInt(value);
        }
        if(typeof wm[name] !== 'undefined') {
            if(typeof wm[name] !== 'boolean') {
                if(typeof wm[name] !== 'object') {
                    wm[name] = [wm[name]];
                }
                wm[name].push(value);
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
            var pass = false;
            if ((currentRule[i].when.length > 1 ) &&  typeof currentRule[i].when == 'object') {
                var multiPass = true;
                for (j = 0; j < currentRule[i].when.length; j++) {
                    var condition = "";
                    console.log(typeof wm[currentRule[i].when[j]]);
                    if (typeof wm[currentRule[i].when[j]] == "string") {
                        condition = '\"' + wm[currentRule[i].when[j]] +'\"'+ currentRule[i].is[j] + '\"'+ currentRule[i].what[j] + '\"';           
                    } else {
                        condition = wm[currentRule[i].when[j]] + currentRule[i].is[j] + currentRule[i].what[j];  
                    }         
                    console.log("[condition]",condition);
                    console.log("[result]",eval(condition));
                    if (!eval(condition)) {
                        multiPass = false;
                        break;
                    }
                }
                console.log(multiPass);
                pass = multiPass;
            }
            else {
                var condition = "";
                console.log(currentRule[i]);
                console.log(typeof wm[currentRule[i].when]);
                    if(typeof wm[currentRule[i].when] != "undefined") {
                    if (typeof wm[currentRule[i].when] == "string") {
                        condition = '\"' + wm[currentRule[i].when] +'\"'+ currentRule[i].is + '\"'+ currentRule[i].what + '\"';           
                    } else {
                        condition = wm[currentRule[i].when] + currentRule[i].is + currentRule[i].what;
                    }  
                    pass = eval(condition);
                }
            }
            if (pass) {
                $.fn.addToWM(currentRule[i].put,currentRule[i].as);
                var removed = currentRule.splice(i,1);
                firedRules.push(...removed);
                i = 0;
            };
        }
        $(".why-explanation").explaination(firedRules,"rules");


        console.log(wm);
    }


    $.fn.backwardChaining = function(id) {
        wm = {};
        let currentRule = Object.assign([], rules);
        // id = $(this).attr("for");
        $.fn.addToWM("recommendation",id);
        console.log(id);
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
    }


    $.fn.explaination = function(items, option) {

        // Explanation Module
        let label = []; // for tag labelling

        function getColor(value, text=false) {
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
            if (label.includes(value)) {
                colorCode = label.indexOf(value);
            } else {
                label.push(value);
                colorCode = label.indexOf(value);
            }
        
            if (!text) {
                return tagColor[colorCode][0];
            } else {
                return tagColor[colorCode][1];
            }
        }

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
                for(item of items) {
                    if (item.when != "recommendation_cat") {
                        why += "<p>";
    
                        if (typeof item.when == "object") {
                            for(i = 0; i<item.when.length;i++) {
                                why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when[i]) +"\">" + item.when[i] + "</span>";
                                why += " is "
                                why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when[i]) +"\">" + wm[item.when[i]]+ "</span>";;
    
                                if (i != item.when.length-1) {
                                    why += " and "
                                }
                            }
                        } else {
                            why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when) +"\">" + item.when + "</span>";
                            why += " is ";
                            why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.when) +"\">" + wm[item.when] + "</span>";
                        }
                        why += ", so ";
                        if (item.when == "budget") {
                            why += "the gift will be in " + "<span id=\"tag\" style=\"background-color:"+ getColor(item.put) +"\">" + item.put + "</span>"+ " range";
                        } else {
                            why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.put) +"\">" + item.put + "</span>";
                            why += " is ";
                            why += "<span id=\"tag\" style=\"background-color:"+ getColor(item.put)+"\">" + item.as + "</span>";
                        }
                        why += "</p>";
                    }
                } 
                break;
            case "facts":
                for(attr in items) {
                    if (items.hasOwnProperty(attr)) {
                        why += `<p></p>`;
                        why += '<p>' + getSpan(attr) + '->' + getSpan(attr,items[attr]) +'</p>';
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
            '<p>'+item.name+'</p>'+
            ' </div>';

            if(((i+1)%3 == 0) || (i == items.length)) {
                itemList += '<div class="empty"></div></div></div>'
            }
        }

        $(this).html(itemList);
    }
    
});










// DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV 
$("#test_jquery").click(function(){
    wm = {} //testing
    firedRules = []
    $.fn.forwardChaining();
    var recommendation = [];
    console.log(recommendation)
    console.log("[wm re]",wm.recommendation)
    if (wm.recommendation !== undefined) {
        console.log("here");
        recommendation = wm.recommendation;
        console.log(recommendation);
    }
    var htmlCode = "";
    console.log("[re]",recommendation)
    if (recommendation.length > 0) {
        $.each(recommendation, function(index, value) {
            console.log(value);
            title = value
            des = title
            price = 0
            htmlCode += '<div style="border: black solid 1px; margin: 10px; padding: 5px;">'+'<h1>'+title+'</h1>'+'<h2>'+
                des+'</h2>'+'<h3>'+price+'</h3>'+'</div>';
        })
    }
    $("#result").html(htmlCode);
    whyString = ""
    for(firedRule of firedRules) {
        whyString += firedRule.description + "<br>";
    }
    $("#why").html(whyString);
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