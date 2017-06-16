// player
var data = {};


function setData (obj){
    data = obj;
}
function getData () {  
    return data;
}

// The special variable 'exports' exposes the functions as public
exports.setData = setData;
exports.getData = getData;