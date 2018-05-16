// soporte de teclado js

// http://keycode.info/

var _keyboard = new Array(256)

var KEY_ARROW_DOWN		= 40;
var KEY_ARROW_UP		= 38;
var KEY_ARROW_LEFT		= 37;
var KEY_ARROW_RIGHT		= 39;


function doKeyDown(e) {
    if (e.keyCode >= 0 && e.keyCode<255)    
	{
        _keyboard[e.keyCode] = true;
    }
}


function doKeyUp(e) {
    if (e.keyCode >= 0 && e.keyCode<255)    
	{
        _keyboard[e.keyCode] = false;
    }
}


function InitKeyboard()
{
	for(var i=0;i<256;++i)
		_keyboard[i] = false;
	
	document.addEventListener("keydown", doKeyDown, true);
	document.addEventListener("keyup", doKeyUp, true);
}

function IsKeyPressed(i) {
	return _keyboard[i];
}

