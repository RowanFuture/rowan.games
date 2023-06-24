﻿
// **********************************************************************************************************************
// 
// Copyright (c)2011, YoYo Games Ltd. All Rights reserved.
// 
// File:			Function_YoYo.js
// Created:			27/05/2011
// Author:			Mike
// Project:			HTML5
// Description:		
// 
// Date				Version		BY		Comment
// ----------------------------------------------------------------------------------------------------------------------
// 27/05/2011		
// 
// **********************************************************************************************************************


var     g_YoYoTimerStart;

// yoyo constants
var     os_win32;
var     os_win64;
var     os_macosx;
var     os_psp;
var     os_ios;
var     os_android;

var     of_challenge_win;
var     of_challenge_lose;
var     of_challenge_tie;
var     leaderboard_type_number;
var     leaderboard_type_time_mins_secs;
var     sessionKey = 0;

var     eDS_TypeMap=1,
        eDS_TypeList=2,
	    eDS_TypeStack=3,
	    eDS_TypeQueue=4,
	    eDS_TypeGrid=5,
	    eDS_TypePriority=6;

// Identify a GameMaker:HTML5 game3
var g_GameMakerIdentifier = aa_1241_kz();
function aa_1241_kz() { return 0x87155211; }

// #############################################################################################
/// Function:<summary>
///             Create a security request object that works out the type of http request to
///             create and allows us to send security checks
///          </summary>
///
/// In:		 <param name="_canvas">The canvcas handle</param>
/// Out:	 <returns>
///				
///			 </returns>
// #############################################################################################
/** @constructor */
function SecurityCheck()
{
    var xmlHttp = null;
    if (window.XMLHttpRequest) {
		//for firefox, opera and safari browswers
		xmlHttp = new XMLHttpRequest();
	}
	if (typeof(XMLHttpRequest) == "undefined")
	{
        xmlHttp = function () {
                try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
                    catch (e) {}
                try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
                    catch (e) {}
                try { return new ActiveXObject("Msxml2.XMLHTTP"); }
                    catch (e) {}
                //Microsoft.XMLHTTP points to Msxml2.XMLHTTP.3.0 and is redundant
                throw new yyError("This browser does not support XMLHttpRequest.");
            };
    }
    this.securityRequest = xmlHttp;    
    this.securityRequestInFlight = false;
}

// Global security check object and session key
var g_securityCheck = new SecurityCheck();

function YYPushEventsDispatch() {
}

function code_is_compiled() { return true; }

// #############################################################################################
/// Function:<summary>
///          	Enable/Disable alpha blending
///          </summary>
///
/// In:		<param name="_on_off"></param>
///				
// #############################################################################################
var draw_enable_alphablend = draw_enable_alphablend_html5;
function draw_enable_alphablend_html5(_on_off)
{
}

// #############################################################################################
/// Function:<summary>
///          	Are online achievements available?
///          </summary>
///
/// Out:	<returns>
///				true/false for yes/no
///			</returns>
// #############################################################################################
var YoYo_AchievementsAvailable = achievement_available;
function achievement_available()
{
    return false;
}

// #############################################################################################
/// Function:<summary>
///          	Log into achievement system
///          </summary>
// #############################################################################################
var YoYo_LoginAchievements = achievement_login;
function achievement_login()
{
}

// #############################################################################################
/// Function:<summary>
///          	Log out of online achievements
///          </summary>
// #############################################################################################
var YoYo_LogoutAchievements = achievement_logout;
function achievement_logout()
{
}


var YoYo_achievement_login_status = achievement_login_status;
function achievement_login_status() { }

var YoYo_achievement_reset = achievement_reset;
function achievement_reset() { }

var YoYo_achievement_show_achievements = achievement_show_achievements;
function achievement_show_achievements() { }

var YoYo_achievement_show_leaderboards = achievement_show_leaderboards;
function achievement_show_leaderboards() { }

var YoYo_achievement_load_friends = achievement_load_friends;
function achievement_load_friends() { }

var YoYo_achievement_load_leaderboard = achievement_load_leaderboard;
function achievement_load_leaderboard(){}

var YoYo_achievement_get_pic = achievement_get_pic;
function achievement_get_pic(){}

var YoYo_achievement_load_progress = achievement_load_progress;
function achievement_load_progress() { }

var YoYo_achievement_send_challenge = achievement_send_challenge;
function achievement_send_challenge() { }

var YoYo_os_get_info = os_get_info;
function os_get_info() {return -1; }


var YoYo_achievement_event = achievement_event;
function achievement_event() { }

var YoYo_achievement_show = achievement_show;
function achievement_show() { }

var YoYo_achievement_get_info = achievement_get_info;
function achievement_get_info() { }

// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_GetConfig = os_get_config;
function os_get_config()
{
    return g_YoYoConfig; //"YOYO_PAID";
}


// #############################################################################################
/// Function:<summary>
///          	Get the platform we're running on (if known)
///          </summary>
///
/// Out:	<returns>
///				BROWSER_UNKNOWN = -1,
///				BROWSER_WIN32 = 0,
///				BROWSER_WIN64 = 1,
///				BROWSER_MACOSX = 2,
///				BROWSER_PSP = 3,
///				BROWSER_IOS = 4,
///				BROWSER_ANDROID = 5,
///				BROWSER_LINUX = 6,
///			</returns>
// #############################################################################################
function    YoYo_GetPlatform() {
	return g_OSPlatform;
}

// #############################################################################################
/// Function:<summary>
///          	Get the "device" type - if knowns
///          </summary>
///
/// Out:	<returns>
///				BROWSER_TYPE = 0,
///				BROWSER_TYPE_UNKNOWN = 255,
///				BROWSER_IPHONE = 0,
///				BROWSER_IPHONE_RETENA = 1,
///				BROWSER_IPAD = 2, 
///			</returns>
// #############################################################################################
function    YoYo_GetDevice(){
	return g_DeviceType;
}


// #############################################################################################
/// Function:<summary>
///          	Get the browser type.
///          </summary>
///
/// Out:	<returns>
///				BROWSER_NOT_A_BROWSER = -1, 	// game is not being played in a browser.
///				BROWSER_UNKNOWN = 0, 		// Unknown browser...
///				BROWSER_IE = 1,
///				BROWSER_FIREFOX = 2,
///				BROWSER_CHROME = 3,
///				BROWSER_SAFARI = 4,
///				BROWSER_OPERA = 5,
///				BROWSER_SAFARI_MOBILE = 6, 
///             BROWSER_DEFAULT_ANDROID = 7,
///             BROWSER_WINDOWS_STORE = 8
///			</returns>
// #############################################################################################
function YoYo_GetBrowser() {
	return g_OSBrowser;
}

// #############################################################################################
/// Function:<summary>
///          	Return the OS version number
///          </summary>
///
/// Out:	<returns>
///				The OS version, or -1
///			</returns>
// #############################################################################################
function YoYo_GetVersion() {
	return g_OSVersion;
}

// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_url"></param>
///			<param name="_target"></param>
///			<param name="_options"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OpenURL_full = url_open_full;
function url_open_full(_url, _target, _options) {
	if (_target != "_self" && _target != "_blank" && _target != "_parent" && _target != "_top"){
		yyError("Error: invalid TARGET specified. Only '_self', '_blank', 'parent' or '_top' supported. (YoYo_OpenURL)");
		return;
	}
	var loaded = window.open(yyGetString(_url), yyGetString(_target), yyGetString(_options));
}

// #############################################################################################
/// Function:<summary>
///          	Open a URL in a window....allowing the developer to specify a target
///          </summary>
///
/// In:		<param name="_url">URL to open</param>
///			<param name="_target">Target to open in</param>
///				
// #############################################################################################
var YoYo_OpenURL_ext = url_open_ext;
function url_open_ext(_url, _target) {
	YoYo_OpenURL_full(_url, _target, "scrollbars=yes,menubar=yes,resizable=yes,toolbar=yes,location=yes,status=yes");
}

// #############################################################################################
/// Function:<summary>
///          	Open a URL in a window....
///          </summary>
///
/// In:		<param name="_url">URL to open</param>
///				
// #############################################################################################
var YoYo_OpenURL = url_open;
function url_open(_url) {
	YoYo_OpenURL_ext(_url, "_self");
}


// #############################################################################################
/// Function:<summary>
///          	Post an online score
///          </summary>
///
/// In:		<param name="_scoreboard">Scoreboard name</param>
///			<param name="_score">Score to post</param>
///				
// #############################################################################################
var YoYo_PostScore = achievement_post_score;
function achievement_post_score(_scoreboard, _score)
{
}

// #############################################################################################
/// Function:<summary>
///          	Post an online achievement
///          </summary>
///
/// In:		<param name="_scoreboard">Scoreboard name</param>
///			<param name="_score">Score to post</param>
///				
// #############################################################################################
var YoYo_PostAchievement = achievement_post;
function    achievement_post( _scoreboard, _achivement )
{
}





// #############################################################################################
/// Function:<summary>
///          	Ask to leave a rating
///          </summary>
///
/// In:		<param name="_text"></param>
///			<param name="_yes"></param>
///			<param name="_no"></param>
///			<param name="_URL"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_LeaveRating = shop_leave_rating;
function shop_leave_rating(_text, _yes, _no, _URL)
{
}

// #############################################################################################
/// Function:<summary>
///             Hires timer
///          </summary>
///
/// Out:	 <returns>
///				time value since start of app
///			 </returns>
// #############################################################################################
var get_timer = (performance.now) ? function() { 
                                        return performance.now() * 1000;
                                } : 
                                    function() {
                                        var t = new Date().getTime() * 1000;
                                        return t - g_YoYoTimerStart;                                        
                                };

var YoYo_GetTimer = get_timer;









// #############################################################################################
/// Function:<summary>
///          	Add a virtual key
///          </summary>
///
/// In:		<param name="_x">x coordinate</param>
///			<param name="_y">y coordinate</param>
///			<param name="_w">width</param>
///			<param name="_h">height</param>
///			<param name="_keycode">key to map to</param>
/// Out:	<returns>
///				virtual key "id"
///			</returns>
// #############################################################################################
var YoYo_AddVirtualKey = virtual_key_add;
function virtual_key_add(_x, _y, _w, _h, _keycode)
{
    _x = yyGetInt32(_x);
    _y = yyGetInt32(_y);
    _w = yyGetInt32(_w);
    _h = yyGetInt32(_h);
    _keycode = yyGetInt32(_keycode);

    var vkey = AllocateVirtualKey();
    
    vkey.x = _x;
    vkey.y = _y;
    vkey.w = _w;
    vkey.h = _h;
    vkey.key = _keycode;
    vkey.x2 = _x + _w;
    vkey.y2 = _y + _h;
    vkey.button = vkey.u = vkey.v = 0;
    vkey.flags = VIRTUALKEY_ACTIVE;
    
    return (vkey.index + 1);
}

// #############################################################################################
/// Function:<summary>
///          	Delete a virtual key
///          </summary>
///
/// In:		<param name="_id"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_DeleteVirtualKey = virtual_key_delete;
function virtual_key_delete(_id) {
    _id = yyGetInt32(_id);

    if (_id < 0) return;

    var index = _id - 1;
    if ((index < 0) || ( index >= g_VirtualKeys.length)) {
        debug("Invalid index when deleting virtual key");
    }
    FreeVirtualKey(_id - 1);
}

// #############################################################################################
/// Function:<summary>
///          	Loop through all the virtual keys and keep a list of the ones to draw.
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
function UpdateVirtualKeyDrawList() {
	g_VirtualKeyDrawList = [];
	// Loop through all the virtual keys and look for draw flags
	for (var l = 0; l < g_VirtualKeys.length; ++l)
	{
		var pKey = g_VirtualKeys[l];
		if ((pKey.flags & VIRTUALKEY_DRAW) != 0) g_VirtualKeyDrawList[g_VirtualKeyDrawList.length] = pKey;
	}
}

// #############################################################################################
/// Function:<summary>
///          	Show the virtual key
///          </summary>
///
/// In:		<param name="_id"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_ShowVirtualKey = virtual_key_show;
function virtual_key_show(_id) {
    _id = yyGetInt32(_id);

	if (_id < 0) return;

	_id--;
	if (!g_VirtualKeys[_id]) return;
	g_VirtualKeys[_id].flags |= VIRTUALKEY_DRAW;
	UpdateVirtualKeyDrawList();
}


// #############################################################################################
/// Function:<summary>
///          	Hide the virtual key
///          </summary>
///
/// In:		<param name="_id"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_HideVirtualKey = virtual_key_hide;
function virtual_key_hide(_id) {
    _id = yyGetInt32(_id);

	if (_id < 0) return;

	_id--;
	if (!g_VirtualKeys[_id]) return;
	g_VirtualKeys[_id].flags &= ~VIRTUALKEY_DRAW;
	UpdateVirtualKeyDrawList();
}

	
// #############################################################################################
/// Function:<summary>
///          	Get TILT on X
///          </summary>
///
/// Out:	<returns>
///				-1 to 1 tilt value
///			</returns>
// #############################################################################################
var YoYo_GetTiltX = device_get_tilt_x;
function device_get_tilt_x()
{
    return 0;
}


// #############################################################################################
/// Function:<summary>
///          	Get TILT on Y
///          </summary>
///
/// Out:	<returns>
///				-1 to 1 tilt value
///			</returns>
// #############################################################################################
var YoYo_GetTiltY = device_get_tilt_y;
function device_get_tilt_y()
{
    return 0;
}


// #############################################################################################
/// Function:<summary>
///          	Get TILT on Z
///          </summary>
///
/// Out:	<returns>
///				-1 to 1 tilt value
///			</returns>
// #############################################################################################
var YoYo_GetTiltZ = device_get_tilt_z;
function device_get_tilt_z()
{
    return 0;
}
	
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_SelectPicture = device_ios_get_imagename;
function device_ios_get_imagename()
{
	MissingFunction("device_ios_get_imagename()");
}

// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_GetPictureSprite = device_ios_get_image;
function device_ios_get_image()
{
	MissingFunction("device_ios_get_image()");
}

// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_StartDashboard = openfeint_start;
function openfeint_start()
{
	MissingFunction("openfeint_start()");
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_a"></param>
///			<param name="_b"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_AddAchievement = achievement_map_achievement;
function achievement_map_achievement(_a, _b)
{
	MissingFunction("achievement_map_achievement()");
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_a"></param>
///			<param name="_b"></param>
///			<param name="_c"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_AddLeaderboard = achievement_map_leaderboard;
function achievement_map_leaderboard(_a, _b, _c)
{
	MissingFunction("achievement_map_leaderboard()");
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_a"></param>
///			<param name="_b"></param>
///			<param name="_c"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_SendChallenge = openfeint_send_challenge;
function openfeint_send_challenge(_a, _b, _c)
{
	MissingFunction("openfeint_send_challenge()");
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_a"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_SendInvite = openfeint_send_invite;
function openfeint_send_invite(_a)
{
	MissingFunction("openfeint_send_invite()");
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_a"></param>
///			<param name="_b"></param>
///			<param name="_c"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_SendSocial = openfeint_send_social;
function openfeint_send_social(_a, _b, _c)
{
	MissingFunction("openfeint_send_social()");
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_a"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_SetURL = openfeint_set_url;
function openfeint_set_url(_a)
{
	MissingFunction("openfeint_set_url()");
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_AcceptChallenge = openfeint_accept_challenge;
function openfeint_accept_challenge()
{
	MissingFunction("openfeint_accept_challenge()");
    return "";
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_IsOnline = achievement_is_online;
function achievement_is_online()
{
	MissingFunction("achievement_is_online()");
    return false;
}
// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_a"></param>
///			<param name="_b"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_OF_SendChallengeResult = openfeint_send_result;
function openfeint_send_result(_a, _b)
{
	MissingFunction("openfeint_send_result()");
}


// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_IsKeypadOpen = device_is_keypad_open;
function device_is_keypad_open() {
	return false;
}

// #############################################################################################
/// Function:<summary>
///          	Init the YoYo plugins.
///          </summary>
///
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
function    YoYo_Init()
{
    g_YoYoTimerStart = new Date().getTime() * 1000;

    var t = 0;
    for(var i=0;i<12;i++){
        totalmonthlen[i] = t;
        t += monthlen[i];        
    }
    
    
    
    os_win32 = 0;
    os_win64 = 1;
    os_macosx = 2;
    os_psp = 3;
    os_ios = 4;
    os_android = 5;

    of_challenge_win = 0;
    of_challenge_lose = 1;
    of_challenge_tie = 2;
    leaderboard_type_number = 0;
    leaderboard_type_time_mins_secs = 1;
}

// #############################################################################################
/// Function:<summary>
///             What to do if the end user fails the security key check (grief the user)
///          </summary>
// #############################################################################################
function YoYo_SecurityFail()
{    
    var t = setTimeout(function() {
            for (var sprIndex in g_pSpriteManager.Sprites)
            {
                if (!g_pSpriteManager.Sprites.hasOwnProperty(sprIndex)) continue;
            
                g_pSpriteManager.Delete(sprIndex);
                break;            
            }
            // And recurse...
            YoYo_SecurityFail();
                        
        }, 1000); // delete a sprite every second
}

// #############################################################################################
/// Function:<summary>
///             Read the session key from the document element as set by the server .php
///          </summary>
// #############################################################################################
function YoYo_GetSessionKey()
{   
    if (!document.getElementById('b4f6074452b74d86ce6d00904fcd389c')) {
        // NM-156 is an arbitrary choice (Queensryche song if you must know...)
        var sessionKeyElement = document.getElementById('NM-156');
        if (sessionKeyElement)
        {
            sessionKey = sessionKeyElement.innerHTML;    
            sessionKeyElement.parentNode.removeChild(sessionKeyElement);
        }
        else {
            YoYo_SecurityFail();        
        }
    }
}

// #############################################################################################
/// Function:<summary>
///             On intialisation this grabs the security key from the server
///          </summary>
// #############################################################################################
function YoYo_CheckSecurity(_url)
{
    if (!document.getElementById('42f28d8caa0d96b967645dce4278ed50')) 
    {    
        // Construct the final url that includes the request data used by the server to check the session state
        var finalUrl = _url + "?" + sessionKey + "=2239";
        // var finalUrl = "http://localhost:80/check_purchase.php?" +  sessionKey + "=2239";
        
        // If a prior security check is in flight then do nothing
        if (!g_securityCheck.securityRequestInFlight)
        {
            g_securityCheck.securityRequestInFlight = true;
            var t = setTimeout(function() {                      
                g_securityCheck.securityRequest.open("GET", finalUrl, true);
                g_securityCheck.securityRequest.onreadystatechange = function () {
                        if (g_securityCheck.securityRequest.readyState == 4)
                        {
                            switch (g_securityCheck.securityRequest.status)
                            {
                                case 200:
                                {
                                    // Check response against our session key
                                    if (g_securityCheck.securityRequest.responseText != sessionKey) 
                                    {
                                        // Do something unpleasant to the user
                                        YoYo_SecurityFail();
                                    }
                                    g_securityCheck.securityRequestInFlight = false;
                                }
                                break;
                                default:                                                                    
                                    alert("ERROR: The game has lost connection to the server. " + g_securityCheck.securityRequest.statusText);
                                    // Enact a reload of the page. Don't use window.location.reload() as that requests the user 
                                    // resubmits data and allows them to deny the request and carry on playing
                                    window.location.href = window.location.href;
                                break;
                            }
                         }
                    };
                    g_securityCheck.securityRequest.send(null);
                }, 5000);  // delay sending for 5 seconds  
        }     
    }
}



// #############################################################################################
/// Function:<summary>
///          	Return the domain the page has been loaded from.
///          </summary>
///
/// Out:	<returns>
///				The domain (127.0.0.1, www.blah.com etc.)
///			</returns>
// #############################################################################################
var YoYo_GetDomain = url_get_domain;
function url_get_domain() {
	return document.domain;
}

// #############################################################################################
/// Function:<summary>
///             Determines the correct kind of object for an asynchronous http request
///          </summary>
// #############################################################################################
function getAsyncRequestObject() {

    if (window.XMLHttpRequest) {
		//for firefox, opera and safari browswers
		return new XMLHttpRequest();
	}
	if (typeof(XMLHttpRequest) == "undefined")
	{       
        try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
        catch (e) {}        
        try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
        catch (e) {}
        try { return new ActiveXObject("Msxml2.XMLHTTP"); }
        catch (e) {}
        //Microsoft.XMLHTTP points to Msxml2.XMLHTTP.3.0 and is redundant
        throw new Error("This browser does not support XMLHttpRequest.");
    }
    return null;
}

// #############################################################################################
/// Function:<summary>
///             Get status of mouse button on device "X"
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
///			 <param name="_button">button to check</param>
/// Out:	 <returns>
///				0  or  1
///			 </returns>
// #############################################################################################
var YoYo_MouseCheckButton = device_mouse_check_button;
function device_mouse_check_button(_dev, _button) {

    _dev = yyGetInt32(_dev);
    _button = yyGetInt32(_button);

    if (_dev==0) {
        return mouse_check_button(_button);
    }
    else {    
        // _button => 0=none,-1=any, 1=LMB, 2=RMB or 3=MBM
        if (g_TouchEvents[_dev] && (_button <= 1)) {

            return g_TouchEvents[_dev].ButtonDown;
        }
    }
    return 0;
}


// #############################################################################################
/// Function:<summary>
///             Get status of mouse button pressed on device "X"
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
///			 <param name="_button">button to check</param>
/// Out:	 <returns>
///				0  or  1
///			 </returns>
// #############################################################################################
var YoYo_MouseCheckButtonPressed = device_mouse_check_button_pressed;
function device_mouse_check_button_pressed(_dev, _button) {

    _dev = yyGetInt32(_dev);
    _button = yyGetInt32(_button);

    if (_dev==0) {
        return mouse_check_button_pressed(_button);
    }
    else {    
        // _button => 0=none,-1=any, 1=LMB, 2=RMB or 3=MBM
        if (g_TouchEvents[_dev] && (_button <= 1)) {

            return g_TouchEvents[_dev].ButtonPressed;
        }
    }
    return 0;
} 


// #############################################################################################
/// Function:<summary>
///             Get status of mouse button released on device "X"
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
///			 <param name="_button">button to check</param>
/// Out:	 <returns>
///				0  or  1
///			 </returns>
// #############################################################################################
var YoYo_MouseCheckButtonReleased = device_mouse_check_button_released;
function device_mouse_check_button_released(_dev, _button) {

    _dev = yyGetInt32(_dev);
    _button = yyGetInt32(_button);

    if( _dev==0 ){
        return mouse_check_button_released(_button);
    }
    else {
        // _button => 0=none,-1=any, 1=LMB, 2=RMB or 3=MBM
        if (g_TouchEvents[_dev] && (_button <= 1)) {

            return g_TouchEvents[_dev].ButtonReleased;
        }
    }
    return 0; 
} 


// #############################################################################################
/// Function:<summary>
///             Get X coordinate of mouse on device "X"
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
/// Out:	 <returns>
///				mouse coordinate
///			 </returns>
// #############################################################################################
var YoYo_MouseX = device_mouse_x;
function device_mouse_x(_dev) {

    _dev = yyGetInt32(_dev);

    if (_dev==0) {
        return g_pBuiltIn.mouse_x;
    }
    else if (g_TouchEvents[_dev]) {
        return g_TouchEvents[_dev].x;
    }
    return 0; 
}

// #############################################################################################
/// Function:<summary>
///          	
///          </summary>
///
/// In:		<param name="_dev"></param>
/// Out:	<returns>
///				
///			</returns>
// #############################################################################################
var YoYo_MouseXRaw = device_mouse_raw_x;
function device_mouse_raw_x(_dev) {

    _dev = yyGetInt32(_dev);

	if (g_InputEvents[_dev])
	{
		return g_InputEvents[_dev].x;
	}
	return 0;
}

// #############################################################################################
/// Function:<summary>
///             Get Y coordinate of mouse on device "X"
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
/// Out:	 <returns>
///				mouse coordinate
///			 </returns>
// #############################################################################################
var YoYo_MouseY = device_mouse_y;
function device_mouse_y(_dev) {

    _dev = yyGetInt32(_dev);

    if (_dev==0) {
        return g_pBuiltIn.mouse_y;
    }
    else if (g_TouchEvents[_dev]) {
        return g_TouchEvents[_dev].y;
    }
    return 0;
}

// #############################################################################################
/// Function:<summary>
///             Get Y coordinate of mouse on device "X"
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
/// Out:	 <returns>
///				mouse coordinate
///			 </returns>
// #############################################################################################
var YoYo_MouseYRaw = device_mouse_raw_y;
function device_mouse_raw_y(_dev) {

    _dev = yyGetInt32(_dev);

    if (g_InputEvents[_dev])
	{
		return g_InputEvents[_dev].y;
	}
	return 0;
}


// #############################################################################################
/// Function:<summary>
///             Convert the mouse X to GUI space
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
/// Out:	 <returns>
///				mouse coordinate
///			 </returns>
// #############################################################################################
function device_mouse_x_to_gui(_dev) {

    _dev = yyGetInt32(_dev);

    var x=0;
    if (_dev == 0) {
        x = g_EventMouseX;
    }
    else if (g_TouchEvents[_dev]) {
        x = g_TouchEvents[_dev].x;
    } 
    CalcCanvasLocation(canvas, g_CanvasRect);
    x  -= g_CanvasRect.left;

	var gui_width = g_GUIWidth;
	if( gui_width<0.0 )  gui_width = window_get_width();

	return ~~(x * (gui_width/window_get_width() ));
}

// #############################################################################################
/// Function:<summary>
///             Convert the mouse Y to GUI space
///          </summary>
///
/// In:		 <param name="_dev">mouse number</param>
/// Out:	 <returns>
///				mouse coordinate
///			 </returns>
// #############################################################################################
function device_mouse_y_to_gui(_dev) {

    _dev = yyGetInt32(_dev);

    var y = 0;
    if (_dev == 0) {
        y = g_EventMouseY;
    }
    else if (g_TouchEvents[_dev]) {
        y = g_TouchEvents[_dev].y;
    }

    CalcCanvasLocation(canvas, g_CanvasRect);
    y -= g_CanvasRect.top;

    var gui_height = g_GUIHeight;
    if (gui_height < 0.0) gui_height = window_get_height();

    return ~ ~(y * (gui_height / window_get_height()));
}


// #############################################################################################
/// Function:<summary>
///             Checks to see if a pause activity came from the OS activity in this frame
///          </summary>
// #############################################################################################
var YoYo_OSPauseEvent = os_is_paused;
function os_is_paused() {
    return g_OSPauseEvent;
}


var YoYo_OSHasFocusEvent = window_has_focus;
function window_has_focus() {
    return g_GameFocus;
}



// #############################################################################################
/// Function:<summary>
///             Checks to see if a data structure of the given type exists.
///             Since all the ds_ routines have been separated there was
///             no obvious place to put this so I've put it here.
///          </summary>
// #############################################################################################
function ds_exists(_ind, _type) {

    _ind = yyGetInt32(_ind);

    switch (yyGetInt32(_type)) {
        case eDS_TypeMap:       return (g_ActiveMaps.Get(_ind) ? 1.0 : 0.0);
        case eDS_TypeList:      return (g_ListCollection.Get(_ind) ? 1.0 : 0.0);
	    case eDS_TypeStack:     return (g_StackCollection.Get(_ind) ? 1.0 : 0.0);
	    case eDS_TypeQueue:     return (g_ActiveQueues.Get(_ind) ? 1.0 : 0.0);
	    case eDS_TypeGrid:      return (g_ActiveGrids.Get(_ind) ? 1.0 : 0.0);
	    case eDS_TypePriority:  return (g_ActivePriorityQueues.Get(_ind) ? 1.0 : 0.0);
	}
	return 0;
};


function script_exists(_ind)			
{ 
    _ind = yyGetInt32(_ind);
    if( _ind >= 100000 )
        _ind -= 100000;
    if( g_pGMFile.Scripts[yyGetInt32(_ind)] != undefined )
    {
        return 1;
    }   
    return 0;
}

function script_get_name(_ind)		
{
    if (typeof _ind ==  "function") {
        var ret = _ind.name;
        if (ret.startsWith("bound ")) {
            ret = ret.substr(6);
        } // end if
        if(g_pGMFile.ScriptNames.indexOf(ret) >= 0)
        {
            return ret;
        }
        return "<unknown>";
    } else {
        _ind = yyGetInt32(_ind);
        if( _ind >= 100000 ) {
            _ind -= 100000;
            if( (g_pGMFile.Scripts[_ind] != undefined) && (g_pGMFile.ScriptNames[_ind] != undefined) ) {
                var name = g_pGMFile.ScriptNames[_ind];
                if( name.startsWith("gml_Script_"))
                    name = name.substr(11);
                return name;
            } // end if
        } // end if
        else {
            global_scripts_init();
            if ((_ind >=0) && (_ind < g_globalScripts.length)) {
                return g_globalScripts[_ind].name;
            } // end if
        } // end else
    } // end else
	    
    return "<undefined>";
}

function script_get(_ind)
{
    _ind = yyGetInt32(_ind);
    if(_ind >= 100000)
    {
        _ind -= 100000;
        if(g_pGMFile.Scripts[_ind] != undefined)
        {
            return g_pGMFile.Scripts[_ind];
        }
    }
    else
    {
        global_scripts_init();
        if ((_ind >=0) && (_ind < g_globalScripts.length))
        {
            return g_globalScripts[_ind];
        }
    }
    return null;
}

function script_execute( _self, _other, _index )
{
    func = undefined;
    if (typeof _index === "function") {
        var newArgs = Array.prototype.slice.call(arguments);
        // move self and other up the arguments
        newArgs[2] = newArgs[1];
        newArgs[1] = newArgs[0];
        // skip passed the index, but keep the self and other
        return _index.apply(this, newArgs.slice(1));        
    } // end if
    else {
        _index == yyGetInt32(_index);
        if (_index < 100000) {
            global_scripts_init();
            if ((_index >=0) && (_index < g_globalScripts.length)) {
                func = g_globalScripts[_index];
                if (func !== undefined) {
                    var newArgs = Array.prototype.slice.call(arguments);
                    // skip passed the index, self and other
                    return func.apply(this, newArgs.slice(3));        
                } // end if
            } // end if
        } // end if
        else {
            _index -= 100000;
            func = JSON_game.Scripts[ _index ];
                if (func !== undefined) {
                    var newArgs = Array.prototype.slice.call(arguments);
                    // move self and other up the arguments
                    newArgs[2] = newArgs[1];
                    newArgs[1] = newArgs[0];
                    // skip passed the index, but keep the self and other
                    return func.apply(this, newArgs.slice(1));        
                } // end if
        } // end else
    } // end else

    return 0;
} // end script_execute

var method_call = script_execute_ext;
function script_execute_ext( _self, _other, _index, _array, _offset, _length )
{
    _offset = _offset || 0;
    _offset = yyGetInt32(_offset);
    _length = _length || _array.length - _offset;
    _length = yyGetInt32(_length);
    if (!(_array instanceof Array)) {
    	yyError( "script_execute_ext : argument 2 is not an array")
    }
    else {

    	var dir = 1;
		if (_offset < 0) _offset = _array.length + _offset;
		if (_offset >= _array.length) _offset = _array.length;
		if (_length < 0) {
			dir = -1;
			if ((_offset + _length) < 0) {
				_length = _offset+1;
			} // end if
			else {
				_length = -_length;
			} // end else
		} // end if
		else {
			if ((_offset + _length) > _array.length) {
				_length = _array.length - _offset;
			} // end if
		} // end else

        var newArgs = [];
		for (var n = _offset, i=0; (i < _length); ++i, n+=dir)
			newArgs.push( _array[n] );


	    func = undefined;
	    if (typeof _index === "function") {
	        newArgs.splice( 0, 0, _self, _other );
	        // skip passed the index, but keep the self and other
	        return _index.apply(this, newArgs);        
	    } // end if
	    else {
	        _index == yyGetInt32(_index);
	        if (_index < 100000) {
	            global_scripts_init();
	            if ((_index >=0) && (_index < g_globalScripts.length)) {
	                func = g_globalScripts[_index];
	                if (func !== undefined) {
	                    // skip passed the index, self and other
	                    return func.apply(this, newArgs);        
	                } // end if
	            } // end if
	        } // end if
	        else {
	            _index -= 100000;
	            func = JSON_game.Scripts[ _index ];
	                if (func !== undefined) {
	                    newArgs.splice( 0, 0, _self, _other );
	                    // skip passed the index, but keep the self and other
	                    return func.apply(this, newArgs);        
	                } // end if
	        } // end else
	    } // end else
	} // end else

    return 0;
} // end script_execute_ext

// #############################################################################################
/// Function:<summary>
///          	Enable or disable faster (no-error-checking) functions
///          </summary>
///
/// In:		<param name="_enable">true for enable</param>
///				
// #############################################################################################
function gml_release_mode(_enable) {
    if (yyGetBool(_enable)) {
        instance_change = instance_change_RELEASE;
        yyInst = yyInst_RELEASE;
        ds_grid_get = ds_grid_get_RELEASE;
        ds_grid_set = ds_grid_set_RELEASE;
        ds_grid_set_pre = ds_grid_set_pre_RELEASE;
        ds_grid_set_post = ds_grid_set_post_RELEASE;
    } else {
        instance_change = instance_change_DEBUG;
        yyInst = yyInst_DEBUG;
        ds_grid_get = ds_grid_get_DEBUG;
        ds_grid_set = ds_grid_set_DEBUG;		
        ds_grid_set_pre = ds_grid_set_pre_DEBUG;
        ds_grid_set_post = ds_grid_set_post_DEBUG;
    }
}

// #############################################################################################
/// Function:<summary>
///          	Enable or disable the automatic drawing of the application surface.
///          </summary>
///
/// In:		<param name="_enable">true for enable</param>
///				
// #############################################################################################

function application_surface_draw_enable(_enable)
{
    g_Application_Surface_Autodraw = yyGetBool(_enable);
}

function application_surface_enable(_enable)
{
    if( g_AppSurfaceEnabled )
    {
        //store so we can restore
        g_OldApplicationWidth = g_ApplicationWidth;
        g_OldApplicationHeight = g_ApplicationHeight;
    }
    g_AppSurfaceEnabled = yyGetBool(_enable);
}

function application_surface_is_enabled()
{
    return g_AppSurfaceEnabled;
}

//-application surface relative to *canvas*
function Get_FullScreenOffset()
{
    var _left = 0;
    var _top = 0;
    var _right = 0;
    var _bottom = 0;
    canvas = document.getElementById(g_CanvasName);
    var cw = DISPLAY_WIDTH;//canvas.width;
    var ch = DISPLAY_HEIGHT;//canvas.height;
    
    if( g_KeepAspectRatio && g_bUsingAppSurface)
    {
        var w = g_ApplicationWidth;
        var h = g_ApplicationHeight;
        var aspect, hh, ww;
        
        aspect = w/h;
        hh = cw / aspect;
        if( hh < ch )
        {
            aspect = h/w;
            hh = cw * aspect;
            _top = (ch - hh)/2;
            ww = cw;
            hh += _top;
        }
        else
        {
            aspect = w/h;
            ww = ch * aspect;
            _left = (cw - ww ) / 2;
            hh = ch;
            ww += _left;
        }
        _right = ww;
        _bottom = hh;
    }
    else
    {
        _right = cw;
        _bottom = ch;
    }

	g_AppSurfaceRect.x = _left;
	g_AppSurfaceRect.y = _top;
	g_AppSurfaceRect.w = _right - _left;
	g_AppSurfaceRect.h = _bottom - _top;
}

// #############################################################################################
/// Function:<summary>
///          	Get the position for default drawing of the application surface.
///          </summary>
///
/// Out:	 <returns>
///				[x,y,w,h]
///			 </returns>
///				
// #############################################################################################

function application_get_position()
{
    Get_FullScreenOffset();
    var arrayData = [];
    arrayData.push( g_AppSurfaceRect.x, g_AppSurfaceRect.y, g_AppSurfaceRect.x + g_AppSurfaceRect.w, g_AppSurfaceRect.y + g_AppSurfaceRect.h );
    return arrayData;
}

//FIX #0013658: Extensions: GameMaker throws a compiler error when using extensions on other platforms
function extension_stubfunc_real()
{
    return 0;
}

function extension_stubfunc_string()
{
    return "";
}

