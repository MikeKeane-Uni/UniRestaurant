function getFormData(form) {
    var inputs = form.querySelectorAll("input");
    var data = {};
    for(var i = 0; i < inputs.length; i++ ) {
        if(inputs[i].type === "submit" || inputs[i].type === "reset") {
            continue;
        }
        data[inputs[i].name] = inputs[i].value;
    }

    return data;
}

function clearFormData(form, excluding) {
    var inputs = form.querySelectorAll("input");

    for(var i = 0; i < inputs.length; i++ ) {
        if(inputs[i].type === "submit" || inputs[i].type === "reset" || (excluding && excluding.indexOf(inputs[i].name) !== -1)) {
            continue;
        }

        inputs[i].value = "";
    }
}


function parseTemplate(template, data) {
    var html = template.innerHTML;
    for(var d in data) {
        if(data.hasOwnProperty(d)) {
            var r = new RegExp("{{\\s*" + d + "\\s*}}");
            html = html.replace(r, data[d]);
        }
    }

    return html;
}

Array.prototype.findObjectInArray = function(property, value) {
    for(var i = 0; i < this.length; i++) {
        if(this[i][property] === value) {
            return this[i];
        }
    }

    return null;
};

//lists
function ListItem(attributes, tagName, template) {
    if(!(this instanceof ListItem)) {
        return new ListItem();
    }

    var self = this;

    //private variables
    var listItems = [];

    var onCreation = function() {
        self.DOMel = document.createElement((tagName ? tagName : "LI"));

        if(!!template) {
            self.DOMel.innerHTML = parseTemplate(template, self.attributes);
        }
    };
    //public variables
    self.DOMel = null;
    self.attributes = attributes ? attributes : null;

    self.set = function(attributeName, value) {
        attributes[attributeName] = value;
    };

    self.get = function(attributeName) {
        return attributes[attributeName];
    };

    self.update = function(newAttributes) {
        var currentAttributes = self.attributes;

        for(var a in newAttributes) {
            if(newAttributes.hasOwnProperty(a)) {
                currentAttributes[a] = newAttributes[a];
            }
        }

        if(!!template) {
            self.DOMel.innerHTML = parseTemplate(template, self.attributes);
        }
    };

    onCreation();
}

function List(DOMElement, itemIdName) {
    if(!(this instanceof List)) {
        return new List();
    }

    var self = this;

    //private variables
    var listItems = [];

    var itemAdded = function() {
        console.log("Item added");
    };

    var itemsById = {
        //items will be stored with a reference to the id
    };

    var onCreation = function() {
        if(!!DOMElement) {
            self.DOMel = DOMElement;
        }
    }

    //public variables
    self.DOMel = null;

    self.reDraw = function() {
        console.log(self.DOMel);
        self.DOMel.innerHTML = "";
        console.log(listItems);
        for(var i = 0; i < listItems.length; i++) {
            self.DOMel.appendChild(listItems[i].DOMel);
        }
    };

    self.add = function(listItem) {
        console.log(listItem);
        listItems.push(listItem);
        console.log(itemIdName);
        console.log(listItem[itemIdName]);
        itemsById[listItem.attributes[itemIdName]] = listItem;

        self.reDraw();
    };

    self.remove = function(criteria) {
        var indexesToRemove = [];
        if(!criteria) {
            //TODO: throw error criteria is required to remove item
            throw new Error("Need to provide criteria to remove item from List");
        }

        for(var i = 0; i < listItems.length; i++) {
            var attrs = listItems[i].attributes;
            console.log(attrs);
            for(var j in attrs) {
                if(attrs.hasOwnProperty(j)) {
                    if(criteria[j]) {
                        if (attrs[j] === criteria[j]) {
                            indexesToRemove.push(i);
                        }
                    }
                }
            }

        }

        listItems = listItems.filter(function(value, index) {
            return indexesToRemove.indexOf(index) === -1;
        });
        console.log("REDRAW");
        self.reDraw();
    };

    self.removeAll = function() {
        listItems = [];

        self.reDraw();
    };

    self.getItems = function() {
        return listItems;
    };

    self.getItemById = function(id) {
        return itemsById[id];
    };

    //run on creation
    onCreation();
}
