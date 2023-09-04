document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');



  let loginform = document.getElementById("compose-form")
  loginform.addEventListener("submit", (e)=>{
    e.preventDefault()
    touser = document.getElementById("compose-recipients").value;
    subjectuser = document.getElementById("compose-subject").value;
    bodyuser = document.getElementById("compose-body").value;

    if (touser.value == "" || subjectuser.value == "" || bodyuser.value == ""){
      alert("Ensure you input a value in both fields!");
    }
    else{
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: touser,
            subject: subjectuser,
            body: bodyuser
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
      });
      load_mailbox('sent')
    }
  })

});
function showemail(id){
  console.log(id)
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#single-email').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

        document.querySelector('#single-email').innerHTML =
        `<h2><b>From</b>: ${email.sender}</h2>
        <h2> <b>To</b>: ${email.recipients}</h2>
        <h2> <b>Subject</b>: ${email.subject}</h2>
        <h2> <b>TimeStamp</b>: ${email.timestamp}</h2>
        `;
        if(!email.read){
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        }
        const thebutton = document.createElement('button');
        thebutton.innerHTML =email.archived ? "unarchive" : "archive" 
        email.archived == false? 
        thebutton.addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            }),
          }).then(()=>{load_mailbox('inbox')})
        }): thebutton.addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            }),
          }).then(()=>{load_mailbox('inbox')})
        })
        const replybutton = document.createElement("button");
        replybutton.innerHTML = "Reply"
        replybutton.className = "btn btn-info"
        replybutton.addEventListener('click', function(){
          compose_email()
          touser = document.getElementById("compose-recipients").value = email.sender ;
          let subject = email.subject
          if(subject.split(' ',1)[0] !="Re:"){
            subject = "Re: " +email.subject
          }
          subjectuser = document.getElementById("compose-subject").value = subject;

          bodyuser = document.getElementById("compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
        })
        document.querySelector('#single-email').append(thebutton);
        document.querySelector('#single-email').append(replybutton);

});


}
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      emails.forEach(email =>{
        const emailuser = document.createElement('div');
        emailuser.className = "borders"

        emailuser.innerHTML =
        `<h1>Sender: ${email.sender}</h1>
        <h1> Subject: ${email.subject}</h1>
        <h1> ${email.timestamp}</h1>`;

        emailuser.className = email.read ? 'read':'unread'

        emailuser.addEventListener('click', function(){
          showemail(email.id)
        });
        document.querySelector('#emails-view').append(emailuser);
      })
  
      // ... do something else with emails ...
  });
}
