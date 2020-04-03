//utility functions
function collectionContains(collection, contains) {
    for(var i = 0; i < collection.length; i++) {
        if(collection[i] === contains) {
            return true;
        }
    }

    return false;
}

function hasParent(el, selector) {
    //all matched to selector
    var matches = document.querySelectorAll(selector);

    //loop until document.body
    var db = document.body;
    var check = el;

    //or match is found
    while(!(check === db)) {
        if(collectionContains(matches, check.parentElement)) {
            return true;
        }

        check = check.parentElement;
    }

    return false;
}

function getParent(el, selector) {
    //all matched to selector
    var matches = document.querySelectorAll(selector);

    //loop until document.body
    var db = document.body;
    var check = el;

    //or match is found
    while(!(check === db)) {
        if(collectionContains(matches, check.parentElement)) {
            return check.parentElement;
        }

        check = check.parentElement;
    }

    return null;
}
