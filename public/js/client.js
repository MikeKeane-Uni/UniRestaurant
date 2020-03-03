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

//inputs
(function() {
    /*
    SEARCH
    <div class="input-holder">
        <div class="material-icons input-icon">search</div>
        <input id="itemSearch" type="text" />
    </div>
     */

    var inputs = document.querySelectorAll("input");

    for(var i = 0; i < inputs.length; i++) {
        (function(input) {
            var inputHolder = input.parentElement;
            input.addEventListener("focus", function() {
                inputHolder.classList.add("active");
            }, false);

            input.addEventListener("blur", function() {
                inputHolder.classList.remove("active");
            }, false);
        })(inputs[i]);

    }
})();

//custom select menu
(function() {
    function selectIsOpen(select) {
        return select.querySelector(".option-container").classList.contains("show");
    }

    function openSelect(select) {
        select.querySelector(".option-container").classList.add("show");
    }

    function closeSelect(select) {
        select.querySelector(".option-container").classList.remove("show");
    }

    function toggleSelect(select) {
        if(selectIsOpen(select)) {
            closeSelect(select);
        } else {
            openSelect(select);
        }
    }

    //option functions
    function showAllOptions(options) {
        for(var i = 0; i < options.length; i++) {
            options[i].classList.remove("hide");
        }
    }

    function hideOption(option) {
        option.classList.add("hide");
    }

    function showOption(option) {
        option.classList.remove("hide");
    }

    function findNextOption(currentOption) {
        var optionSet = currentOption.parentElement.querySelectorAll(".option");
        return currentOption.nextElementSibling ? currentOption.nextElementSibling : optionSet[0];
    }

    function findPreviousOption(currentOption) {
        var optionSet = currentOption.parentElement.querySelectorAll(".option");
        return currentOption.previousElementSibling ? currentOption.previousElementSibling : optionSet[optionSet.length - 1];

    }

    function selectOption(option) {
        var optionSet = option.parentElement.querySelectorAll(".option");
        for(var i = 0; i < optionSet.length; i++) {
            if(optionSet[i] === option) {
                optionSet[i].classList.add("selected");
                getParent(option, ".select").currentOption = optionSet[i];
            } else {
                optionSet[i].classList.remove("selected");
            }
        }
    }

    function filterOptions(options, search) {
        for(var i = 0; i < options.length; i++) {
            if(options[i].innerText.toLowerCase().indexOf(search.toLowerCase().trim()) === -1) {
                hideOption(options[i]);
            } else {
                showOption(options[i]);
            }
        }
    }

    var selects = document.querySelectorAll(".select, .select-multi");

    for(var i = 0; i < selects.length; i++) {
        (function(select) {
            select.options = select.querySelectorAll(".option");
            select.currentOption = select.options[0];

            var isMulti = select.classList.contains("select-multi");
            var inputHolder = select.parentElement;
            var optionContainer = select.querySelector(".option-container");

            if(isMulti) {
                select.querySelector("input").addEventListener("focus", function () {
                    inputHolder.classList.add("active");
                }, false);

                select.querySelector("input").addEventListener("blur", function () {
                    //closeSelect(select);
                    inputHolder.classList.remove("active");
                }, false);
            } else {
                select.addEventListener("focus", function () {
                    inputHolder.classList.add("active");
                }, false);

                select.addEventListener("blur", function () {
                    //closeSelect(select);
                    inputHolder.classList.remove("active");
                }, false);
            }

            var options = optionContainer.querySelectorAll(".option");

            for(var j = 0; j < options.length; j++) {
                var option = options[j];
                var selectedOption = select.querySelector(".selected");
                (function(selectedOption) {
                    option.addEventListener("click", function() {
                        if(selectedOption.nodeName === "INPUT") {
                            selectedOption.value = this.innerText;
                        } else {
                            selectedOption.innerText = this.innerText;
                        }
                    }, true);
                })(selectedOption);
            }

            if(isMulti) {
                select.addEventListener("input", function(e) {
                    if(!selectIsOpen(select)) {
                        openSelect(select);
                    }
                    var textInput = select.querySelector("input");

                    var key = e.data; //may need to do something for cross browser here

                    filterOptions(select.querySelectorAll(".option"), textInput.value);

                }, false);
            } else {
                select.setAttribute("tabindex", "0");
            }
        })(selects[i]);
    }

    window.addEventListener("click", function(e) {
        if(!hasParent(e.target, ".select, .select-multi")) {
            for(var i = 0; i < selects.length; i++) {
                closeSelect(selects[i]);
            }
        } else {
            var thisSelect = getParent(e.target, ".select, .select-multi");

            for(var i = 0; i < selects.length; i++) {
                if(selects[i] === thisSelect) {
                    toggleSelect(thisSelect);
                } else {
                    closeSelect(selects[i]);
                }
            }
        }
    }, false);

    window.addEventListener("keydown", function(e) {
        var key = e.code; //may need to do something cross browser
        var selectIsActive = false;
        var activeSelect = null;
        var isMulti = false;

        if(document.activeElement.classList.contains("select")) {
            selectIsActive = true;
            activeSelect = document.activeElement;
        } else if(document.activeElement.classList.contains("select-multi")) {
            selectIsActive = true;
            activeSelect = document.activeElement;
            isMulti = true;
        } else if(hasParent(document.activeElement, ".select, .select-multi")) {
            selectIsActive = true;
            activeSelect = getParent(document.activeElement, ".select, .select-multi");

            if(activeSelect.classList.contains("select-multi")) {
                isMulti = true;
            }
        }

        if(selectIsActive) {
            if (key === "Space") {
                if(!isMulti) {
                    toggleSelect(activeSelect);
                }
            } else if(key === "Enter") {
                toggleSelect(activeSelect);
            } else if(key === "ArrowDown") {
                e.preventDefault();
                if(selectIsOpen(activeSelect)) {
                    //move to next option
                    var nextOption = findNextOption(activeSelect.currentOption);
                    selectOption(nextOption);
                } else {
                    openSelect(activeSelect);
                }
            } else if(key === "ArrowUp") {
                e.preventDefault();
                if(selectIsOpen(activeSelect)) {
                    //move to previous option
                    var prevOption = findPreviousOption(activeSelect.currentOption);
                    selectOption(prevOption);
                } else {
                    openSelect(activeSelect);
                }
            } else if(key === "Tab") {
                //blur does not work because option is not selected if clicked.
                closeSelect(activeSelect);
            }


        }
    }, true);
})();
