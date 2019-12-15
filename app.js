var fs = require('fs');
var nodemailer = require('nodemailer')
const fetch = require('node-fetch');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})


const help = () => {
    console.log('please enter any of the following commands 1-5')
    console.log('(1) Generate joke and print it in the standard output')
    console.log('(2) Add email to the list of recipients')
    console.log('(3) Send the extracted joke the emails')
    console.log('(4) Removing Duplicate email addresses from emails.json')
    console.log('(5) To end the program session')
}

const sendEmails = (joke) => {

    // this is the most important function of the program, it asks the user for it's cridentials, and then sends the extracted joke to the email addresses from the emails.json file one by one and shows info whether it succcceed or not.
    console.log("Please make sure your gmail account less secure option is on  or go to the following address https://myaccount.google.com/lesssecureapps")

    readline.question('From: ', email => {
        readline.question('Password: ', password => {


            fs.readFile('emails.json', (err, data) => {
                let student = JSON.parse(data);

                for (var i = 0, len = student.length; i < len; ++i) {
                    var obj = student[i];

                    let HelperOptions = {
                        from: email,
                        to: obj.email,
                        subject: 'Chuck Norris Joke',
                        text: joke
                    };

                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        secure: false,
                        port: 25,
                        auth: {
                            user: email,
                            pass: password
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });


                    transporter.sendMail(HelperOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log("The message was sent!");
                        console.log(info.response);
                        console.log(info.envelope);
                    });
                }
            });

        })
        })

}

const appendEmailList = (email) => {

    // This function is called from the getEmail function and is called once the email is validated, it reads the file emails.json and adds the new email address into it
    fs.readFile('emails.json', 'utf-8', function(err, data) {
        if (err) throw err
        var arrayOfObjects = JSON.parse(data)
        arrayOfObjects.push({
            "email": email
        })

        fs.writeFile('emails.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
    })
}

const getEmail = () => {


    // This function askes for email as user input, validates the input as regex expression and writes to the user whether it's correct or not.
    console.log("Please enter a a correct email address :\n" +
        "for ex John.Smith@example.com")
    readline.question(`Enter the recipent email address: `, (email) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
        {
            appendEmailList(email)
            console.log('Email has been added.')
            return
        }
        else{
            console.log("wrong email add format please, enter help to see the user manual")
            return;
        }
    })
}


const extractJoke = async () => {

    // This function executes after typing the corresponding commands, fetches the joke from the api and return it's value
    var url = "https://api.chucknorris.io/jokes/random"
    let headers;
    var joke;
    // Fetch makes it easier to make asynchronous requests and handle responses better than with the older
   var data = await fetch(url, { method: 'GET', headers: headers})
        .then((res) => {
            return res.json()
        })
        .then(
            (json => {
                joke = json.value;
            })
        )

    return joke;

}
const removeDuplicates = () => {

    // This function reads the emails.json file and removes the duplicate email addresses from the file and saves it back


    fs.readFile('emails.json', 'utf-8', function(err, data) {
        if (err) throw err
        var arrayOfObjects = JSON.parse(data)


        var grades = {};
        arrayOfObjects.forEach( function( item ) {

            var grade = grades[item.email] = grades[item.email] || {};
        });

        var outputList = [];
        for( var email in grades ) {
                outputList.push({ email: email});
        }

        outputList = JSON.stringify( outputList, null, 4 );


        fs.writeFile('emails.json', outputList, 'utf-8', function(err) {
            if (err) throw err
            console.log('Dupplicates removed !')
        })


    })

}
const main = async () => {

    console.log("*********************************************************************")

    console.log("This is a standalone gui Javascript application,\n" +
        "which allows you to send Chuck Norris jokes from the Chuck Norris API and sends\n" +
        "them to the emails listed in the emails file,\n" )
      console.log("Please type help for more details.\n");

    console.log('please enter any of the following commands 1-5 or write help for more details')
    console.log('(1) Show joke (2) Add email (3) Send to emails (4) Remove Duplicate emails (5) To exit')
    console.log("*********************************************************************")

    readline.on('line', async (line) => {

        switch (line.toLowerCase().trim()) {
            case 'help':
                help();
                break
            case '1':
               joke = await extractJoke();
               console.log("Chuck Norris announces that "+joke)
                break
            case '2':
                getEmail();
                break
            case '3':
                joke = await extractJoke();
                sendEmails(joke);
                break
            case '4':
                removeDuplicates();
                break;
            case '5':
                process.exit();
            default:
                console.log("Please enter a valid command or type help to see the user manual")

        }

    })


}

main();

