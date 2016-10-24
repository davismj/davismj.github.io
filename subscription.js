var modal = document.getElementById('subscription-modal');
var content = document.getElementById('modal-content');
var email = document.getElementById('subscription-email');
var open = document.getElementById('subscription-button');
var subscribe = document.getElementById('subscribe-button');
var cancel = document.getElementById('cancel-button');
var thanks = document.getElementById('subscribe-thanks');

// on open click
open.addEventListener('click', function(event) {
	
	// record click with formspree
	var record = new XMLHttpRequest();
	record.open('POST', 'https://formspree.io/davis.matthewjames@gmail.com');
	record.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');	
	record.send('subject=Subscription%20Button%20Clicked');

	showModal();
});
cancel.addEventListener('click', hideModal);
modal.addEventListener('click', function onclick(event) {

	// only hide if the greyed out portion of the modal is clicked
	if (event.target == modal) {
		hideModal();
	}
});
email.addEventListener('focus', function(event) {
	email.classList.remove('invalid');
});
subscribe.addEventListener('click', function(event) {

	if (!email.value) {
		email.classList.add('invalid');
		return;
	}

	// send a new request to mailchimp
	var request = new XMLHttpRequest();
	request.open('POST', '//davismj.us11.list-manage.com/subscribe/post');
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.setRequestHeader('Accept', 'application/json');
	request.addEventListener('load', onload);
	request.addEventListener('error', onload);
	request.send('u=085d73ebee6205ba545fd7a00&id=64aca48f63&MERGE0=' + email.value);
	
	// show a thank you message
	function onload() { 
		content.innerHTML = thanks.innerHTML;
		setTimeout(hideModal, 5000);
	};
});

function hideModal() {
	document.removeEventListener('keydown', onescape);
	modal.classList.remove('visible');
}
function showModal() {
	document.addEventListener('keydown', onescape);
	modal.classList.add('visible');
}
function onescape(event) {
	if (event.keyCode == 27) {
		hideModal();
	}
}