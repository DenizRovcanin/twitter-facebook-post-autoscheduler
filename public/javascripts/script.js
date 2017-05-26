//Remove ugly hash
if (window.location.hash === '#_=_'){
    history.replaceState ? history.replaceState(null, null, window.location.href.split('#')[0]) : window.location.hash = '';
}
//Validation
var inputValue = document.querySelector('#share-input');
var facebookCheckBox = document.querySelector('#fb');
var twitterCheckBox = document.querySelector('#tw');
var autoschedulerCheckbox = document.querySelector('#cmn-toggle-1');
var valMsg = document.querySelector('#validate-msg');
//POST
function postLinks() {
    if(inputValue.value.length && (facebookCheckBox.checked || twitterCheckBox.checked)) {

        facebookCheckBox.required = '';
        twitterCheckBox.required = '';
        $(valMsg).fadeOut('slow');
        //Start xhr
        var shareObj = {
            shareValue: inputValue.value,
            facebookChecked: facebookCheckBox.checked,
            twitterChecked: twitterCheckBox.checked,
            autoSet: autoschedulerCheckbox.checked
        };
        var xhr = new XMLHttpRequest();
        var url = "http://localhost:3000/share";

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                //Something...
            }
            else {
                //Something...
            }
        };
        xhr.send(JSON.stringify(shareObj));
    }
    else if(!facebookCheckBox.checked || !twitterCheckBox.checked) {
        facebookCheckBox.required = true;
        twitterCheckBox.required = true;
        $(valMsg).fadeIn('slow');
    }
}