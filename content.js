let semanticExtractor = function () {
    let nameCount = 0;
    // List of semantic attribtues
    const semanticStructure = ["searchBox",
        // -- search results --
        "searchResults",
        "searchResultItem",
        "form",
        // -- menu --
        "menu",
        "subMenu",
        // -- sort --
        "sortOptions",
        // -- filter --
        "filterOptions",
        "filterOptionGroup",
        "appliedFilterList",
        "reviewList", //review
        "recommendationList", //recommendation                           
        "modal",
        "popupWindow",
        "popoverWindow",
        "comment",
        "calender",
        // -- More results button -- //
        "pageList",
        "moreResults"
    ];

    registerEvents();

    function setCustomAttribute(element) {
        // Create a attribute value mixing with a number to make it unique
        let customName = 'focus' + nameCount.toString(10);
        // Using 'name' as custom attribute
        element.setAttribute('data-semanticname', customName);

        // Increament counter
        nameCount += 1;
    }

    function focusTheElement(attrValue) {
        let grabber = "data-semanticname=" + attrValue;
        $(window).scrollTop($('[' + grabber + ']').position().top);
        $('[' + grabber + ']').css('background-color', 'yellow');
    }

    function checkSemantciAttributeExists(element) {
        // get the data-attributes of the element         
        let element_dataset = element.dataset;
        if (Object.keys(element_dataset).length > 0) {
            // Object.values creates an array from the values of JSON
            dataAttrValues = Object.values(element_dataset);
            // Loop through the data-attribute value array
            for (let index = 0; index < dataAttrValues.length; index++) {
                // Check each of them if it exists in semanticStructure
                // If exists, then we have found out thing and return
                if (semanticStructure.includes(dataAttrValues[index])) {
                    return true;
                } else {
                    continue;
                }
            }
        }
        return false;
    }

    function sendMessageToExtension(attribtues_of_element){
        // Listens to the connection from extension.js
        chrome.runtime.onConnect.addListener((port) => {
            // Send the content to the extension.js 
            port.postMessage({
                attributes: attribtues_of_element
            });
        });
    }

    function registerEvents() {
        // Check here first        
        document.addEventListener('keydown', function (e) {
            // For grabbing exact node | when S is pressed [Code 83]
            if (e.which == 83) {
                e.preventDefault();

                let attribtues_of_element = {}

                // Get the highlighted element  
                let element = window.getSelection().anchorNode.parentElement;

                // Set a custom attribute to focus it later
                setCustomAttribute(element);


                // Create a JSON using the attribtue values                 
                attribtues_of_element["semanticname"] = element.getAttribute("data-semanticname");
                attribtues_of_element["text"] = window.getSelection().toString()

                sendMessageToExtension(attribtues_of_element);
            }

            // For getting semantic node | when D is pressed[Code 68]
            if (e.which == 68) {
                e.preventDefault();

                let attribtues_of_element = {}

                // Iteratively check for semantic data attrbute in parents
                let element = window.getSelection().anchorNode.parentElement;
                let isSemanticExists = checkSemantciAttributeExists(element);
                while (isSemanticExists == false) {
                    element = element.parentElement;
                    isSemanticExists = checkSemantciAttributeExists(element);
                }

                // Set a custom attribute to focus it later
                setCustomAttribute(element);                                

                attribtues_of_element["text"] = window.getSelection().toString();
                attribtues_of_element["semanticname"] = element.getAttribute("data-semanticname");                                

                sendMessageToExtension(attribtues_of_element);
            }
        });


        // Listens for messages sent from extension
        chrome.runtime.onConnect.addListener((port) => {
            // Send the content to the extension.js 
            port.onMessage.addListener((response) => {
                console.log(response.customAttrValue);
                // Clear all focus
                $('[data-semanticname]').css('background-color', '');
                focusTheElement(response.customAttrValue.toString());
            });
        });
    }
}();