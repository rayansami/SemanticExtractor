let list = document.getElementById('extension-list');
let btncount = 0;

registerEvents();
// Send the attribute to the webpage, so that it can get focus
function focusOnWebPage(e) {
    // Send the content to the webpage
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        // Connect to the active tab
        let port = chrome.tabs.connect(tabs[0].id);
        port.postMessage({
            // e.target gives the element. Then getting the attribute value for name
            customAttrValue: e.target.getAttribute('data-semanticname')
        });
    });
}

// Build an anchor tag and wrap it with li
function buildElement(attributes) {
    let li = document.createElement("li");

    let a = document.createElement("a");
    a.dataset.semanticname = attributes.semanticname;
    a.text = attributes.text;
    // Set onclick for each list element
    a.onclick = focusOnWebPage;

    let button = document.createElement("BUTTON");
    button.innerHTML = 'Delete';
    button.id = 'btn' + btncount;
    btncount++;

    li.append(a);
    li.append(button);

    return li;
}

// This sends deleted element information to webpage
// So that attribtue JSON can be updated
function updateSenderOnDeletion(dataAttrVal) {
    // Send content to the webpage
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        // Connect to the active tab
        let port = chrome.tabs.connect(tabs[0].id);
        port.postMessage({
            // e.target gives the element. Then getting the attribute value for name
            deletedAttrVal: dataAttrVal
        });
    });
}

function deleteOperation(e){
    e = e || window.event;
    
    // target brings up the element that's being clicked on the document
    var target = e.target || e.srcElement,
        text = target.textContent || target.innerText;

    // Pass deleted element information to the sender
    // Delete button is placed after <a> tag that has data-attr. Thats why accessing previous sibling here            
    updateSenderOnDeletion(target.previousSibling.getAttribute('data-semanticname'));
    //console.log(target.previousSibling.getAttribute('data-semanticname'));

    list.removeChild(target.parentNode);
}

function registerEvents() {
    // It detects the clicked element and delete the list element if Delete button is clicked.
    document.addEventListener('click', deleteOperation, false);
}
// First-thing here
// Wait till loading the page to initiate connection  
window.addEventListener('load', (event) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        // Connect to the active tab
        let port = chrome.tabs.connect(tabs[0].id);

        // Listens for the message from the content.js
        port.onMessage.addListener((response) => {
            // Build the element using the existing attributes      
            //console.log(response.attributes);
            let element = buildElement(response.attributes);
            // Add to the list in Extension                  
            list.append(element);
        });
    });
});