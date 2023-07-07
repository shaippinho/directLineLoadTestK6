import http, { get } from 'k6/http';
import { sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    scenarios: {
        ramping: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { target: 50, duration: '2m' },
                { target: 17, duration: '4m' }                
            ]
        }
    }
};

export default function () {
    var obj = startRequest();
    var t = obj.token;
    var i = obj.conversationId;
    sleep(15);
    sendActivity(t, i);
    sleep(40);
    getActivity(t, i);
    sleep(1);
}
function startRequest() {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer xxxxxxxxxxx',//Direct Line Secret
        }
    };

    var res = http.post("https://directline.botframework.com/v3/directline/conversations/", "", params);

    if (res.status != 200 && res.status != 201) {
        logError(res, "START REQUEST");         
    }

    var obj = JSON.parse(res.body);
    return obj;
}

//Função Send activity - envia solicitação (request)
function sendActivity(token, ID) {
    var url = 'https://directline.botframework.com/v3/directline/conversations/{{ID}}/activities';
    url = url.replace('{{ID}}', ID);
    const payload = JSON.stringify({
        "type": "Message",
        "from": {
            "id": "User"
        },
        "text": "Hello!"
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    };

    var res = http.post(url, payload, params);

    if (res.status != 200 && res.status != 201) {
        logError(res, "SEND ACTIVITY");  
    }

}

// GET- Get activity - resposta 
function getActivity(token, ID) {
    var url = 'https://directline.botframework.com/v3/directline/conversations/{{ID}}/activities';
    url = url.replace('{{ID}}', ID)
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    };
    var res = http.get(url, params);

    if (res.status != 200 && res.status != 201) {
        logError(res, "GET ACTIVITY");       
    }
}


function logError(res, nameFunction)
{
    var error = res;
    var nameLog = nameFunction;

    console.log("");
    console.log("");
    console.log("---- ERRO " + nameLog + " -- ");
    console.log("");
    console.log(error);
    console.log("");
    console.log("---- FIM " + nameLog + " -- ");
    console.log("");
    console.log("");
}


export function handleSummary(data) {
    return {
        "report.html": htmlReport(data),
    };
}