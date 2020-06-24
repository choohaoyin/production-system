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

// retrieve item
function getItem(id) {
    var cat = id.replace(/[^a-z]/gi, '');
    console.log(cat,id);

    var matched = items[cat].filter(function (item) {
        return item.id == id;
    })[0];

    console.log(matched)

    return matched;
}


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

$(".occ-button").click(function () {
    $(this).parents('fieldset').find('label').removeClass("active");
    $(this).addClass("active");
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


    function getItem(id) {
        var cat = id.replace(/[^a-z]/gi, '');
        console.log(cat,id);

        var matched = items[cat].filter(function (item) {
            return item.id == id;
        })[0];

        console.log(matched)

        return matched;
    }

    // If the next button is submit button
    if ($(this).hasClass("submit")) {
        // disableButton(this,fw);
        $.fn.forwardChaining("#msform");
        if (wm.hasOwnProperty("recommendation")) {
            var recommendation_item = []
            for(recommendation_id of wm["recommendation"]) {
                recommendation_item.push(getItem(recommendation_id));
            }
            $("#recommendation").children(".carousel-inner").displayItem(recommendation_item);

            if (recommendation_item.length <= 3) {
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
    var matched = getItem(id);
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
$(".close").on("click", function() {
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

$("#category").change(function () {
    $('#items').children('.carousel-inner').getCategory($(this).val());
})

// Pop up modal window for each item detail
$("#items .carousel-inner").on("click",".carousel-item .item-container", function () {
    var id = $(this).attr("for");
    var cat = id.replace(/[^a-z]/gi, '');


    console.log(cat,id);

    var matched = getItem(id);

    console.log(matched);

    $(".popup-overlay, .why-title, .popup-content, .buy-button, .item-img, .item-name, .item-price").addClass("active");    
    $(".item-img").attr("src","assets/"+matched.img);
    $(".item-name").html(matched.name);
    $(".item-price").html(matched.price);
    $(".buy-button").attr("onclick",'location.href=\"'+matched.link+'\"');

    $.fn.backwardChaining(id);
    
    $("#for-explanation").explaination(wm,"facts");

});

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
                                

                                for (q = 0; q <  wm[currentRule[i].when[j][p]].length ; q++) {
                                    if (typeof wm[currentRule[i].when[j][p]][q] == "string") {
                                        condition += `("${wm[currentRule[i].when[j][p]][q]}" ${currentRule[i].is[j][p]} "${currentRule[i].what[j][p]}")`;
                                    } else {
                                        condition += `(${wm[currentRule[i].when[j][p]][q]} ${currentRule[i].is[j][p]} ${currentRule[i].what[j][p]})`;
                                    }
                                    
                                    if(q != wm[currentRule[i].when[j][p]].length - 1) {
                                        condition += "||";
                                    }
                                }
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
                console.log("condition is true",currentRule[i].put,currentRule[i].as);
                console.log(wm);
                $.fn.addToWM(currentRule[i].put,currentRule[i].as);
                console.log(wm);
                var removed = currentRule.splice(i,1);
                console.log("removed", removed);
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
                            var logic = "==";
                            var fact= wm[currentRule[i].put[j]][p];
                            if (fact.replace(/[^!=]/gi, '') == "!=") {
                                logic = "!=";
                                fact = fact.replace(/[^a-z]/gi, '')
                            }
                            if (typeof fact == "string") {
                                cond += `("${fact}" ${logic} "${wm[currentRule[i].put[j]][p]}")`;
                            } else {
                                cond += `(${fact} ${logic}  ${wm[currentRule[i].put[j]][p]})`;
                            }

                            if(p != wm[currentRule[i].put[j]].length - 1) {
                                if (logic == "=="){
                                    condition += "||";
                                } else {
                                    condition += "&&";
                                }
                            }
                        }
                    } else {
                        var logic = "==";
                        var fact= wm[currentRule[i].put[j]];
                        if (fact.replace(/[^!=]/gi, '') == "!=") {
                            logic = "!=";
                            fact = fact.replace(/[^a-z]/gi, '')
                        }
                        if (typeof fact == "string") {
                            condition += `( "${fact}"  ${logic}  "${currentRule[i].as[j]}" )`;

                        } else {
                            condition += `( ${fact}  ${logic}  ${currentRule[i].what[j]} )`;
                        }      
                    }  
                    if(j != currentRule[i].when.length - 1) {
                        if (logic == "=="){
                            condition += "||";
                        } else {
                            condition += "&&";
                        }
                    } 
                    
                }
            } else {
                if (typeof currentRule[i].as == "object") {
                    var logic = "==";
                    var fact= wm[currentRule[i].put];
                    if (fact.replace(/[^!=]/gi, '') == "!=") {
                        logic = "!=";
                        fact = fact.replace(/[^a-z]/gi, '')
                    }
                    var arr = ""
                    for (p = 0 ; p < currentRule[i].as.length; p++) {
                        if (typeof currentRule[i].as[p] == "string") {
                            condition += `("${fact}" ${logic} "${currentRule[i].as[p]}")`;
                        } else {
                            condition += `(${fact} ${logic} ${currentRule[i].as[p]})`;
                        }


                        if(p != currentRule[i].as.length -1) {
                            if (logic == "=="){
                                condition += "||";
                            } else {
                                condition += "&&";
                            }
                        }
                    }
                } else if((typeof wm[currentRule[i].put] == "object")) {
                    
                    var arrWM = "";
                    var logic = "==";
                    
                    if (typeof currentRule[i].as == "object") {
                        for (m = 0 ; m < currentRule[i].as.length; m++) {
                            for (n = 0 ; n < wm[currentRule[i].put].length; n++) {
                                var fact= wm[currentRule[i].put][n];
                                if (fact.replace(/[^!=]/gi, '') == "!=") {
                                    logic = "!=";
                                    fact = fact.replace(/[^a-z]/gi, '')
                                }
        
                                if (typeof fact == "string") {
                                    condition += `("${fact}" ${logic} "${currentRule[i].as[m]}")`;
                                } else {
                                    condition += `("${fact}" ${logic} "${currentRule[i].as[m]}")`;
                                }
                                if(n != wm[currentRule[i].put].length -1) {
                                    if (logic == "=="){
                                        condition += "||";
                                    } else {
                                        condition += "&&";
                                    }
                                }
                            }

                            if(m != currentRule[i].as.length.length -1) {
                                if (logic == "=="){
                                    condition += "||";
                                } else {
                                    condition += "&&";
                                }
                            }
                            
                        }
                    } else {
                        for (n = 0 ; n < wm[currentRule[i].put].length; n++) {
                            var fact= wm[currentRule[i].put][n];
                            if (fact.replace(/[^!=]/gi, '') == "!=") {
                                logic = "!=";
                                fact = fact.replace(/[^a-z]/gi, '')
                            }
    
                            if (typeof fact == "string") {
                                condition += `("${fact}" ${logic} "${currentRule[i].as}")`;
                            } else {
                                condition += `(${fact} ${logic} ${currentRule[i].as})`;
                            }

                            if(n != wm[currentRule[i].put].length -1) {
                                if (logic == "=="){
                                    condition += "||";
                                } else {
                                    condition += "&&";
                                }
                            }
                        }
                    }
                    
                } else {
                    var logic = "==";
                    if (wm.hasOwnProperty(currentRule[i].put)) {
                        var fact= wm[currentRule[i].put];
                        if (fact.replace(/[^!=]/gi, '') == "!=") {
                            logic = "!=";
                            fact = fact.replace(/[^a-z]/gi, '')
                        }
                        if (typeof fact == "string") {
                            condition += `( "${fact}" ${logic} "${currentRule[i].as}" )`;
                        } else {
                            condition += `( ${fact} ${logic}  ${currentRule[i].as} )`;
                        }
                    } else {
                        condition = false;
                    }
                }
            }

            console.log(`[condition] [${i}] ${condition}`);
            console.log(eval(condition));

            if (eval(condition)) {
                console.log("condition is true");
                console.log(wm);
                var logic = "";
                if (typeof currentRule[i].when == "object") {
                    for(k=0;k<currentRule[i].when.length;k++) {
                        if (typeof currentRule[i].when[k] == "object") {
                            for(m=0;m<currentRule[i].when[k].length ; m++) {
                                if (currentRule[i].is[k][m] == "!=") logic = "!=";
                                $.fn.addToWM(currentRule[i].when[k][m],logic+currentRule[i].what[k][m])
                            }
                        } else {
                            if (currentRule[i].is[k] == "!=") logic = "!=";
                            $.fn.addToWM(currentRule[i].when[k],logic+currentRule[i].what[k])
                        }
                    }
                } else {
                    if (currentRule[i].is == "!=") logic = "!=";
                    $.fn.addToWM(currentRule[i].when,logic+currentRule[i].what);
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
                for(rule of items) {
                    if (typeof rule.when == "object") {
                        switch(rule.put) {
                            case "age group":
                                if (typeof rule.when[0] != "object") {
                                    why += `<p>The receipient ${getSpan(rule.when[0])} `
                                } else {
                                    why += `<p>The receipient ${getSpan(rule.when[0][0])} `
                                }
                                for(i=0;i<rule.when.length;i++) {
                                    if (typeof rule.when[i] == "object") {
                                        for (j=0;j<rule.when[i].length;j++) {
                                            var is;
                                            switch(rule.is[i][j]) {
                                                case "==":
                                                    is = "is";
                                                    break;
                                                case "!=":
                                                    is = "is not";
                                                    break;
                                                case ">=":
                                                case ">":
                                                    is = "is more than";
                                                    break;
                                                case "<=":
                                                case "<":
                                                    is = "is less than";
                                                    break;
                                            }
                                            why += `${is} ${getSpan(rule.when[i][j],rule.what[i][j])}`;

                                            if (i != rule.when[i].length - 1) why += " and "
                                        }
                                    } else {
                                        var is;
                                        switch(rule.is[i]) {
                                            case "==":
                                                is = "is";
                                                break;
                                            case "!=":
                                                is = "is not";
                                                break;
                                            case ">=":
                                            case ">":
                                                is = "is more than";
                                                break;
                                            case "<=":
                                            case "<":
                                                is = "is less than";
                                                break;
                                        }
                                        why += `${is} ${getSpan(rule.when[i],rule.what[i])}`;

                                        if (i != rule.when.length - 1) why += " or "
                                    }
                                }
                                why += `, so the ${getSpan(rule.put)} is ${getSpan(rule.put,rule.as)}</p>`;
                                break;
                            case "range":
                                if (typeof rule.when[0] != "object") {
                                    why += `<p>The ${getSpan(rule.when[0])} `
                                } else {
                                    why += `<p>The ${getSpan(rule.when[0][0])} `
                                }
                                for(i=0;i<rule.when.length;i++) {
                                    if (typeof rule.when[i] == "object") {
                                        for (j=0;j<rule.when[i].length;j++) {
                                            var is;
                                            switch(rule.is[i][j]) {
                                                case "==":
                                                    is = "is";
                                                    break;
                                                case "!=":
                                                    is = "is not";
                                                    break;
                                                case ">=":
                                                case ">":
                                                    is = "is more than";
                                                    break;
                                                case "<=":
                                                case "<":
                                                    is = "is less than";
                                                    break;
                                            }
                                            why += `${is} ${getSpan(rule.when[i][j],rule.what[i][j])}`;

                                            if (i != rule.when[i].length - 1) why += " and "
                                        }
                                    } else {
                                        var is;
                                        switch(rule.is[i]) {
                                            case "==":
                                                is = "is";
                                                break;
                                            case "!=":
                                                is = "is not";
                                                break;
                                            case ">=":
                                            case ">":
                                                is = "is more than";
                                                break;
                                            case "<=":
                                            case "<":
                                                is = "is less than";
                                                break;
                                        }
                                        why += `${is} ${getSpan(rule.when[i],rule.what[i])}`;

                                        if (i != rule.when.length - 1) why += " or "
                                    }
                                }
                                why += `, so the gift ${getSpan(rule.put)} is ${getSpan(rule.put,rule.as)}</p>`;
                                break;
                            case "recommendation":
                                why += `<p>The`;
                                for(i=0;i<rule.when.length;i++) {
                                    for(j=0;j<rule.when[i].length;j++) {
                                        var is;
                                        switch(rule.is[i][j]) {
                                            case "==":
                                                is = "is";
                                                break;
                                            case "!=":
                                                is = "is not";
                                                break;
                                            case ">=":
                                            case ">":
                                                is = "is more than";
                                                break;
                                            case "<=":
                                            case "<":
                                                is = "is less than";
                                                break;
                                        }
                                        why += `${getSpan(rule.when[i][j])} ${is} ${getSpan(rule.when[i][j],rule.what[i][j])}`;
                                        if (j != rule.when[i].length - 1 ) {
                                            if (rule.when[i].length != 2) {
                                                why += ", ";
                                            } else {
                                                why += " and"
                                            }
                                        }
                                    }
                                }
                                break;
                        }
                        
                    } else {
                        switch(rule.put) {
                            case "age group":
                                why += `<p>The ${getSpan(rule.when)} `;
                                var is;
                                switch(rule.is) {
                                    case "==":
                                        is = "is";
                                        break;
                                    case "!=":
                                        is = "is not";
                                        break;
                                    case ">=":
                                    case ">":
                                        is = "is more than";
                                        break;
                                    case "<=":
                                    case "<":
                                        is = "is less than";
                                        break;
                                }
                                why += `${is} ${getSpan(rule.when,rule.what)}`;
                                why += `, so the ${getSpan(rule.put)} is ${getSpan(rule.put,rule.as)}</p>`;
                                break;
                            case "range":
                                why += `<p>The receipient ${getSpan(rule.when)} `;
                                var is;
                                switch(rule.is) {
                                    case "==":
                                        is = "is";
                                        break;
                                    case "!=":
                                        is = "is not";
                                        break;
                                    case ">=":
                                    case ">":
                                        is = "is more than";
                                        break;
                                    case "<=":
                                    case "<":
                                        is = "is less than";
                                        break;
                                }
                                why += `${is} ${getSpan(rule.when,rule.what)}`;
                                why += `, so the gift ${getSpan(rule.put)} is ${getSpan(rule.put,rule.as)}</p>`;
                                break;
                            case "recommendation":
                                why += `<p>The`;
                                for(i=0;i<rule.when.length;i++) {
                                    for(j=0;j<rule.when[i].length;j++) {
                                        var is;
                                        switch(rule.is[i][j]) {
                                            case "==":
                                                is = "is";
                                                break;
                                            case "!=":
                                                is = "is not";
                                                break;
                                            case ">=":
                                            case ">":
                                                is = "is more than";
                                                break;
                                            case "<=":
                                            case "<":
                                                is = "is less than";
                                                break;
                                        }
                                        why += `${getSpan(rule.when[i][j])} ${is} ${getSpan(rule.when[i][j],rule.what[i][j])}`;
                                        if (j != rule.when[i].length - 1 ) {
                                            if (rule.when[i].length != 2) {
                                                why += ", ";
                                            } else {
                                                why += " and"
                                            }
                                        }
                                    }
                                }
                                break;
                        }
                    }
                } 
                break;
            case "facts":
                for(attr in items) {
                    if (items.hasOwnProperty(attr)) { 
                        switch(attr) {
                            case "budget":
                                var budget = items[attr];
                                if (typeof budget == "object") {
                                    budget = budget[0];
                                }
                                compare = "more than"
                                if(budget == 100) {
                                    compare = "around"
                                }
                                why += `<p>For the ${getSpan(attr)} ${compare} ${getSpan(attr,`RM ${budget}`)}</p>`;
                                break;
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
                                        let nAgeGroup = items["age group"].length;
                                        for (k=0; k<nAgeGroup ; k++) {
                                            var fact= items["age group"][k];
                                            if (fact.replace(/[^!=]/gi, '') == "!=") {
                                                age_group = "";
                                                break;
                                            } else {
                                                age_group += getSpan("age group", items["age group"][k]);
                                                if ((nAgeGroup == 2) && (k != nAgeGroup - 1)) {
                                                    age_group += " or ";
                                                } else if (k != nAgeGroup - 1){
                                                    age_group += ", "
                                                }
                                            }
                                        }
                                    }

                                    if (age_group != "") {
                                        if (typeof items[attr] == "object"){
                                                why += `<p>For ${getSpan("age group",age_group)} who ${getSpan(attr)} range from ${getSpan(attr,items[attr][0])} to ${getSpan(attr,items[attr][items[attr].length - 1])}</p>`;
                                            } else {
                                                why += `<p>For ${getSpan("age group",age_group)} who ${getSpan(attr)} at around ${getSpan(attr,items[attr])}</p>`;
                                            }
                                    } else {
                                        if (typeof items[attr] == "object"){
                                            why += `<p>The gift is suitable for those with ${getSpan(attr)} range from ${getSpan(attr,items[attr][0])} to ${getSpan(attr,items[attr][items[attr].length - 1])}</p>`;
                                        } else {
                                            why += `<p>The gift is suitable for those with ${getSpan(attr)} at around ${getSpan(attr,items[attr])}</p>`;

                                        }
                                    }
                                }



                                break;
                            case "gender":
                                why += `<p>The gift is for a ${getSpan(attr,items[attr])} receipient</p>`;
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

    $.fn.getCategory = function (category_code) {
        itemList = []
        if (category_code == "all") {
            for(category in items) {
                itemList.push(...items[category])
            }
            $(this).displayItem(itemList);
        } else {
            $(this).displayItem(items[category_code]);
        }
    }
});










// DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV DEV 





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