var element = document.getElementById('subscription-button');
element.addEventListener('click', function(event) {

	var record = new XMLHttpRequest();
	record.open('POST', 'https://formspree.io/davis.matthewjames@gmail.com');
	record.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');	
	record.send('subject=Subscription%20Button%20Clicked');

	var email = window.prompt('What is your email address?');
	if (!email) {
		return;
	}
	var request = new XMLHttpRequest();
	request.open('POST', '//davismj.us11.list-manage.com/subscribe/post');
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.setRequestHeader('Accept', 'application/json');
	request.addEventListener('load', onload);
	request.addEventListener('error', onload);
	request.send('u=085d73ebee6205ba545fd7a00&id=64aca48f63&MERGE0=' + email);
	function onload() { window.alert("Success! Check your email to confirm your subscription."); };
});