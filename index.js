const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';

function ratePassword(password) {
    return zxcvbn(password);
}

function convoMsgConstructor(role) {
    return (content) => {
        return {role, content};
    };
}

const systemMsg = convoMsgConstructor('system');
const userMsg = convoMsgConstructor('user');
const assistantMsg = convoMsgConstructor('assistant');

function askModel(password) {
    // construct conversation
    const convo = [
        systemMsg('You are a helpful AI assistant.'),
        userMsg(
            `How strong is the password '${password}'? Can you come up with ` +
            `a number of true/false values, in the form of categorical tags ` +
            `which may or may not apply to a given password, and which show ` +
            `relative strength of the password compared to others?`
        ),
    ];

    // construct fetch request
    const api_key = document.querySelector('#api-key').value;
    
    return fetch(ENDPOINT, {
            method: "POST",
            headers: new Headers([
                ["Content-Type", "application/json"],
                ["Authorization", `Bearer ${api_key}`]
            ]),
            body: JSON.stringify({
                "model": MODEL,
                "temperature": 0,
                messages: convo,             
            }),
        })
        .then((res) => res.json())
        // extract model message
        .then((data) => {
            console.log(data);
            return data.choices[0].message.content;            
        });
}

addEventListener('load', () => {
    document.querySelector('#title').innerText = document.title;
    
    const pwInput = document.querySelector('#password');
    
    const updateZxcvbn = () => {
        const password = pwInput.value;
        const score = ratePassword(password).score;

        const zxbcvbnFeedback = `zxcvbn says ${score + 1}/5`;
        document.querySelector('#feedback-zxcvbn').innerText = zxbcvbnFeedback;
    };

    pwInput.addEventListener('input', () => updateZxcvbn());

    document.querySelector('#send').addEventListener('click', () => {
        updateZxcvbn();

        const feedbackGPT = document.querySelector('#feedback-chatgpt');
        feedbackGPT.innerText = "awaiting chatgpt response...";

        askModel(pwInput.value).then((feedback) => {
            feedbackGPT.innerText = feedback;
        });
    });
});