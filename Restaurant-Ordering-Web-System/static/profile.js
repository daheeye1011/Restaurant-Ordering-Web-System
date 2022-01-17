
function sendRequest(request, method, path) {
    let data = null;
    request.onreadystatechange = () => {
      if (request.readyState == 4 && request.status == 200) {
        data = JSON.parse(request.response);
      } else if (request.status.toString().startsWith("4")) {
        console.log(`error ${request.response}`);
      }
    };
    request.open(method, path, false);
    request.setRequestHeader("Accept", "application/json");
    request.send();
  
    return data["restaurant"];
}

function save() {
    let str = document.getElementById("username").innerHTML;
    let userId = str.split(' ')[6].replace(":",'');
    let privacy;
    if(document.getElementById('privacy-true').checked) {   
        privacy = true;
    } else if (document.getElementById('privacy-false').checked) {
        privacy = false;
    }
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState == 4 && request.status == 200) {
        alert("saved");
      } else if (request.status.toString().startsWith("4")) {
        alert(`error(${request.response}): privacy has not been saved`);
      }
    };
    request.open("PUT", `http://localhost:3000/user/${userId}`, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify({privacy}));
}
  