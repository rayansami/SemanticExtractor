let list = document.getElementById('extension-list');

// Send the attribute to the webpage, so that it can get focus
function focusOnWebPage(e){        
    // Send the content to the webpage
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Connect to the active tab
        let port = chrome.tabs.connect(tabs[0].id);
        port.postMessage({
            // e.target gives the element. Then getting the attribute value for name
            customAttrValue: e.target.getAttribute('data-semanticname')
        });
      });
}

// Build an anchor tag and wrap it with li
function buildElement(attributes){
    let li = document.createElement("li");
    
    let a = document.createElement("a");    
    a.dataset.semanticname = attributes.semanticname;
    a.text = attributes.text;  
    // Set onclick for each list element
    a.onclick = focusOnWebPage;
    li.append(a);    

    return li;
}

// First-thing here
// Wait till loading the page to initiate connection  
window.addEventListener('load', (event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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